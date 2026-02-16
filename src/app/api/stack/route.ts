import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

async function getDbUser(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: dbUser } = await supabase
    .from("users")
    .select("id")
    .eq("github_id", user.user_metadata?.user_name || user.id)
    .single();

  return dbUser;
}

// GET /api/stack — returns current user's stack skill IDs
export async function GET() {
  const supabase = await createClient();
  const dbUser = await getDbUser(supabase);

  if (!dbUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: stack } = await supabase
    .from("user_stacks")
    .select("skill_id")
    .eq("user_id", dbUser.id);

  return NextResponse.json({
    skill_ids: (stack || []).map((s) => s.skill_id),
  });
}

// POST /api/stack — add a skill to stack
export async function POST(request: NextRequest) {
  const { skill_id } = await request.json();

  if (!skill_id) {
    return NextResponse.json({ error: "skill_id required" }, { status: 400 });
  }

  const supabase = await createClient();
  const dbUser = await getDbUser(supabase);

  if (!dbUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Use admin client to bypass RLS (auth validated above)
  const admin = createAdminClient();
  const { error } = await admin.from("user_stacks").upsert(
    { user_id: dbUser.id, skill_id },
    { onConflict: "user_id,skill_id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// DELETE /api/stack — remove a skill from stack
export async function DELETE(request: NextRequest) {
  const { skill_id } = await request.json();

  if (!skill_id) {
    return NextResponse.json({ error: "skill_id required" }, { status: 400 });
  }

  const supabase = await createClient();
  const dbUser = await getDbUser(supabase);

  if (!dbUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Use admin client to bypass RLS (auth validated above)
  const admin = createAdminClient();
  await admin
    .from("user_stacks")
    .delete()
    .eq("user_id", dbUser.id)
    .eq("skill_id", skill_id);

  return NextResponse.json({ success: true });
}
