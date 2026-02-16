import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SecurityBadge } from "@/components/skills/SecurityBadge";
import { EditableStackGrid } from "@/components/skills/EditableStackGrid";
import type { Skill, User, SecurityGrade } from "@/lib/supabase/types";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `@${username}'s OpenClaw Stack`,
    description: `See what OpenClaw skills @${username} uses. Create and share your own stack on ClawStack.`,
    openGraph: {
      title: `@${username}'s OpenClaw Stack`,
      images: [`/api/og?type=stack&username=${username}`],
    },
  };
}

export default async function UserStackPage({ params }: Props) {
  const { username } = await params;
  const supabase = await createClient();

  // Get user
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .single();

  if (!user) notFound();

  const typedUser = user as User;

  // Get user's stack
  const { data: stackItems } = await supabase
    .from("user_stacks")
    .select("skill_id")
    .eq("user_id", typedUser.id);

  let skills: Skill[] = [];
  if (stackItems && stackItems.length > 0) {
    const skillIds = stackItems.map((s) => s.skill_id);
    const { data } = await supabase
      .from("skills")
      .select("*")
      .in("id", skillIds);
    skills = (data as Skill[]) || [];
  }

  // Check if current viewer is the profile owner
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  let isOwner = false;
  if (authUser) {
    const ghUsername =
      authUser.user_metadata?.user_name || authUser.id;
    isOwner = ghUsername === typedUser.github_id;
  }

  // Calculate average security score
  const avgScore =
    skills.length > 0
      ? skills.reduce((sum, s) => sum + (s.security_score || 0), 0) /
        skills.length
      : 0;
  const avgGrade: SecurityGrade =
    avgScore >= 90
      ? "S"
      : avgScore >= 75
        ? "A"
        : avgScore >= 60
          ? "B"
          : avgScore >= 40
            ? "C"
            : "D";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Profile header */}
      <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-center gap-4">
          {typedUser.avatar_url ? (
            <img
              src={typedUser.avatar_url}
              alt={typedUser.username}
              className="h-16 w-16 rounded-full"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
              {typedUser.username[0].toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {typedUser.display_name || typedUser.username}
            </h1>
            <p className="text-sm text-muted">@{typedUser.username}</p>
          </div>
        </div>

        {typedUser.bio && (
          <p className="mt-4 text-foreground">{typedUser.bio}</p>
        )}

        {/* Stack stats */}
        <div className="mt-6 flex items-center gap-6">
          <div>
            <span className="text-2xl font-bold text-foreground">
              {skills.length}
            </span>
            <span className="ml-1 text-sm text-muted">skills</span>
          </div>
          {skills.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">Stack Safety:</span>
              <SecurityBadge grade={avgGrade} size="md" showLabel />
            </div>
          )}
        </div>
      </div>

      {/* Skills grid */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Skills in Stack
          </h2>
          {isOwner && skills.length > 0 && (
            <Link
              href="/skills"
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:border-primary hover:text-primary"
            >
              + Add Skills
            </Link>
          )}
        </div>
        <EditableStackGrid initialSkills={skills} isOwner={isOwner} />
      </div>

      {/* Share CTA — only show for visitors */}
      {!isOwner && (
        <div className="mt-8 rounded-xl bg-gradient-to-r from-primary to-primary-light p-6 text-center">
          <p className="text-lg font-semibold text-white">
            Create your own OpenClaw Stack
          </p>
          <p className="mt-1 text-sm text-white/80">
            Share what skills you use with the community.
          </p>
          <a
            href="/api/auth/callback?provider=github"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-primary hover:bg-gray-50"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Get Started
          </a>
        </div>
      )}
    </div>
  );
}
