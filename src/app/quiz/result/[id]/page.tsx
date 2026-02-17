import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SkillCard } from "@/components/skills/SkillCard";
import { InstallCommand } from "@/components/skills/InstallCommand";
import type { Skill } from "@/lib/supabase/types";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: result } = await supabase
    .from("quiz_results")
    .select("role, platform, goal, recommended_skill_ids")
    .eq("id", id)
    .single();

  if (!result) return { title: "Quiz Result Not Found" };

  const count = result.recommended_skill_ids?.length || 0;

  return {
    title: `Your OpenClaw Recommendations — ${count} Skills`,
    description: `Personalized OpenClaw skill recommendations for a ${result.role} using ${result.platform} to automate ${result.goal}. ${count} safe, trusted skills selected.`,
    openGraph: {
      title: `${count} Skills Picked For You`,
      description: `Personalized for: ${result.role} • ${result.platform} • ${result.goal}`,
      images: [`/api/og?type=quiz&id=${id}`],
    },
  };
}

const roleLabels: Record<string, string> = {
  developer: "Developer",
  creator: "Creator",
  operations: "Operations",
  general: "General User",
};

const platformLabels: Record<string, string> = {
  github: "GitHub",
  slack: "Slack",
  discord: "Discord",
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  general: "Multiple Platforms",
};

const goalLabels: Record<string, string> = {
  code: "Coding",
  email: "Email",
  calendar: "Calendar",
  "social-media": "Social Media",
  data: "Data & Analysis",
  security: "Security",
};

export default async function QuizResultPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: result } = await supabase
    .from("quiz_results")
    .select("*")
    .eq("id", id)
    .single();

  if (!result) notFound();

  let skills: Skill[] = [];
  if (result.recommended_skill_ids && result.recommended_skill_ids.length > 0) {
    const { data } = await supabase
      .from("skills")
      .select("*")
      .in("id", result.recommended_skill_ids);
    skills = (data as Skill[]) || [];
  }

  // Build combined install commands
  const installCommands = skills
    .filter((s) => s.install_command)
    .map((s) => s.install_command!)
    .join(" && ");

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero-bg">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[120px]" />

        <div className="relative mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:py-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-4 py-1.5 text-sm font-medium text-indigo-300">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Personalized for you
          </div>

          <h1 className="mt-6 text-3xl font-black text-white sm:text-4xl">
            {skills.length} Skills Recommended
          </h1>

          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-3">
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-slate-300">
              {roleLabels[result.role] || result.role}
            </span>
            <span className="text-slate-600">•</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-slate-300">
              {platformLabels[result.platform] || result.platform}
            </span>
            <span className="text-slate-600">•</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-slate-300">
              {goalLabels[result.goal] || result.goal}
            </span>
          </div>

          <p className="mt-4 text-slate-400">
            All recommended skills have a safety grade of B or higher.
          </p>
        </div>
      </section>

      {/* Results */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Install all */}
        {installCommands && (
          <div className="mb-8 rounded-xl border border-border bg-card p-6">
            <h2 className="mb-3 text-sm font-bold text-foreground">
              Install All ({skills.filter((s) => s.install_command).length}{" "}
              skills)
            </h2>
            <InstallCommand command={installCommands} />
          </div>
        )}

        {/* Skills grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>

        {/* CTAs */}
        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/quiz"
            className="rounded-lg border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-card-hover"
          >
            Retake Quiz
          </Link>
          <a
            href="/api/auth/callback?provider=github"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Save to My Stack
          </a>
        </div>

        {/* Share section */}
        <div className="mt-10 rounded-xl border border-border bg-card p-6 text-center">
          <h3 className="text-sm font-bold text-foreground">
            Share your results
          </h3>
          <p className="mt-1 text-sm text-muted">
            Let others discover the best skills for their needs too.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <input
              type="text"
              readOnly
              value={`${process.env.NEXT_PUBLIC_SITE_URL || "https://clawstack.sh"}/quiz/result/${id}`}
              className="w-full max-w-md rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
