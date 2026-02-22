import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SkillCard } from "@/components/skills/SkillCard";
import { InstallCommand } from "@/components/skills/InstallCommand";
import QuizResultActions from "@/components/quiz/QuizResultActions";
import type { Skill } from "@/lib/supabase/types";
import {
  ANONYMOUS_QUIZ_RESULT_ID,
  buildQuizResultPayload,
  buildQuizResultSharePath,
  readQuizResultPayloadFromSearchParams,
} from "@/lib/quiz/resultLink";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

interface StoredQuizResult {
  id: string;
  role: string | null;
  platform: string | null;
  goal: string | null;
  recommended_skill_ids: string[] | null;
  created_at?: string | null;
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

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://clawstack.sh";

function toPayload(result: StoredQuizResult | null | undefined) {
  return buildQuizResultPayload({
    role: result?.role || "Unknown role",
    platform: result?.platform || "Unknown platform",
    goal: result?.goal || "Unknown goal",
    recommended_skill_ids: result?.recommended_skill_ids || [],
    created_at: result?.created_at,
  });
}

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { id } = await params;
  const paramsObj = await searchParams;

  const sharedPayload = readQuizResultPayloadFromSearchParams(paramsObj);
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from("quiz_results")
    .select("role, platform, goal, recommended_skill_ids")
    .eq("id", id)
    .single();

  const savedResult = error || !result ? null : (result as StoredQuizResult);
  const current = savedResult ?? sharedPayload;

  if (!current) return { title: "Quiz Result Not Found" };

  const count = current.recommended_skill_ids?.length || 0;

  return {
    title: `Your OpenClaw Recommendations — ${count} Skills`,
    description: `Personalized OpenClaw skill recommendations for a ${current.role} using ${current.platform} to automate ${current.goal}. ${count} safe, trusted skills selected.`,
    openGraph: {
      title: `${count} Skills Picked For You`,
      description: `Personalized for: ${current.role} • ${current.platform} • ${current.goal}`,
      images:
        id !== ANONYMOUS_QUIZ_RESULT_ID ? [`/api/og?type=quiz&id=${id}`] : [],
    },
  };
}

export default async function QuizResultPage({ params, searchParams }: Props) {
  const { id } = await params;
  const paramsObj = await searchParams;
  const sharedPayload = readQuizResultPayloadFromSearchParams(paramsObj);

  const supabase = await createClient();
  const { data: rawResult, error } = await supabase
    .from("quiz_results")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Failed to load quiz result:", error);
  }

  const savedResult = rawResult ? (rawResult as StoredQuizResult) : null;
  const current = savedResult ?? sharedPayload;

  if (!current) notFound();

  const payload = toPayload(current);
  const ids = payload.recommended_skill_ids;

  let skills: Skill[] = [];
  if (ids.length > 0) {
    const { data } = await supabase.from("skills").select("*").in("id", ids);
    skills = (data as Skill[]) || [];
  }

  const installCommands = skills
    .filter((s) => s.install_command)
    .map((s) => s.install_command!)
    .join(" && ");

  const isAnonymous = !savedResult;
  const resultPath = buildQuizResultSharePath(id, payload);
  const resultUrl = `${baseUrl}${resultPath}`;

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
              {roleLabels[payload.role] || payload.role}
            </span>
            <span className="text-slate-600">•</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-slate-300">
              {platformLabels[payload.platform] || payload.platform}
            </span>
            <span className="text-slate-600">•</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-slate-300">
              {goalLabels[payload.goal] || payload.goal}
            </span>
          </div>

          <p className="mt-4 text-slate-400">
            All recommended skills have a safety grade of B or higher.
          </p>
          {isAnonymous && (
            <p className="mt-2 text-xs text-amber-200">
              This result is shareable and not persisted to your account yet.
            </p>
          )}
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

        <QuizResultActions
          resultPath={resultPath}
          resultLink={resultUrl}
          resultId={id}
          skillCount={skills.length}
          isAnonymous={isAnonymous}
        />
      </div>
    </div>
  );
}
