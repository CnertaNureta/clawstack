import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const admin = createAdminClient();
  const meta = user.user_metadata;
  const githubId = meta?.user_name || user.id;

  const { data, error } = await admin
    .from("users")
    .upsert(
      {
        github_id: githubId,
        username: meta?.user_name || meta?.preferred_username || user.id,
        display_name: meta?.full_name || meta?.name || null,
        avatar_url: meta?.avatar_url || null,
      },
      { onConflict: "github_id" }
    )
    .select("id, username, avatar_url")
    .single();

  if (error) {
    console.error("ensure-user upsert error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
