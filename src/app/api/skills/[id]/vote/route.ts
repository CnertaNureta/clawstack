import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: skillId } = await params;
  const { vote_type } = await request.json();

  if (!["up", "down"].includes(vote_type)) {
    return NextResponse.json({ error: "Invalid vote type" }, { status: 400 });
  }

  const supabase = await createClient();

  // Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get our user record
  const { data: dbUser } = await supabase
    .from("users")
    .select("id")
    .eq("github_id", user.user_metadata?.user_name || user.id)
    .single();

  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Check existing vote
  const { data: existing } = await supabase
    .from("votes")
    .select("id, vote_type")
    .eq("user_id", dbUser.id)
    .eq("skill_id", skillId)
    .single();

  if (existing) {
    if (existing.vote_type === vote_type) {
      // Remove vote (toggle off)
      await supabase.from("votes").delete().eq("id", existing.id);
      // Update skill count
      const field = vote_type === "up" ? "upvotes" : "downvotes";
      await supabase.rpc("decrement_skill_field", {
        skill_id: skillId,
        field_name: field,
      });
    } else {
      // Change vote direction
      await supabase
        .from("votes")
        .update({ vote_type })
        .eq("id", existing.id);
    }
  } else {
    // New vote
    await supabase.from("votes").insert({
      user_id: dbUser.id,
      skill_id: skillId,
      vote_type,
    });
    const field = vote_type === "up" ? "upvotes" : "downvotes";
    await supabase.rpc("increment_skill_field", {
      skill_id: skillId,
      field_name: field,
    });
  }

  return NextResponse.json({ success: true });
}
