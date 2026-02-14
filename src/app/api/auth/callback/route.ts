import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Create/update user in our users table
      const ghUser = data.user.user_metadata;
      await supabase.from("users").upsert(
        {
          github_id: ghUser.user_name || data.user.id,
          username: ghUser.user_name || ghUser.preferred_username || data.user.id,
          display_name: ghUser.full_name || ghUser.name || null,
          avatar_url: ghUser.avatar_url || null,
        },
        { onConflict: "github_id" }
      );

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth error - redirect to home
  return NextResponse.redirect(`${origin}/?error=auth_failed`);
}
