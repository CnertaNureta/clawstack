import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Try by slug first, then by id
  let { data, error } = await supabase
    .from("skills")
    .select("*")
    .eq("slug", id)
    .single();

  if (error || !data) {
    ({ data, error } = await supabase
      .from("skills")
      .select("*")
      .eq("id", id)
      .single());
  }

  if (error || !data) {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 });
  }

  // Fetch reviews for this skill
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, user:users(*)")
    .eq("skill_id", data.id)
    .order("created_at", { ascending: false })
    .limit(20);

  // Fetch similar skills (same category)
  const { data: similar } = await supabase
    .from("skills")
    .select("id, slug, name, security_grade, upvotes, category")
    .eq("category", data.category)
    .neq("id", data.id)
    .order("upvotes", { ascending: false })
    .limit(6);

  return NextResponse.json({
    skill: data,
    reviews: reviews || [],
    similar: similar || [],
  });
}
