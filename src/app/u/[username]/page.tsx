import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SkillCard } from "@/components/skills/SkillCard";
import { SecurityBadge } from "@/components/skills/SecurityBadge";
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
      {skills.length > 0 ? (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Skills in Stack
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {skills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-lg text-muted">
            This stack is empty. Skills will appear here once added.
          </p>
        </div>
      )}

      {/* Share CTA */}
      <div className="mt-8 rounded-xl bg-gradient-to-r from-primary to-primary-light p-6 text-center">
        <p className="text-lg font-semibold text-white">
          Create your own OpenClaw Stack
        </p>
        <p className="mt-1 text-sm text-white/80">
          Share what skills you use with the community.
        </p>
      </div>
    </div>
  );
}
