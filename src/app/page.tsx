import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SkillCard } from "@/components/skills/SkillCard";
import { SearchBar } from "@/components/layout/SearchBar";
import { CATEGORIES, type Skill } from "@/lib/supabase/types";

const CATEGORY_COLORS: Record<string, string> = {
  communication: "bg-sky-400",
  productivity: "bg-amber-400",
  "dev-tools": "bg-violet-400",
  "smart-home": "bg-emerald-400",
  finance: "bg-yellow-400",
  entertainment: "bg-pink-400",
  security: "bg-red-400",
  "ai-models": "bg-cyan-400",
  automation: "bg-orange-400",
  social: "bg-indigo-400",
  other: "bg-gray-400",
};

export default async function HomePage() {
  const supabase = await createClient();

  const { data: trending } = await supabase
    .from("skills")
    .select("*")
    .order("weekly_votes", { ascending: false })
    .limit(6);

  const { data: newest } = await supabase
    .from("skills")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(6);

  const { count: totalCount } = await supabase
    .from("skills")
    .select("*", { count: "exact", head: true });

  // Security stats queries
  const { count: gradeD } = await supabase
    .from("skills")
    .select("*", { count: "exact", head: true })
    .eq("security_grade", "D");

  const { count: gradeC } = await supabase
    .from("skills")
    .select("*", { count: "exact", head: true })
    .eq("security_grade", "C");

  const { count: gradeS } = await supabase
    .from("skills")
    .select("*", { count: "exact", head: true })
    .eq("security_grade", "S");

  const { count: gradeA } = await supabase
    .from("skills")
    .select("*", { count: "exact", head: true })
    .eq("security_grade", "A");

  const total = totalCount || 6493;
  const malicious = gradeD || 0;
  const caution = gradeC || 0;
  const safe = (gradeS || 0) + (gradeA || 0);
  const riskPct =
    total > 0 ? Math.round(((malicious + caution) / total) * 100) : 0;

  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-hero-bg">
        {/* Grid pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(14,165,233,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.06) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Radial glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />

        <div className="relative mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8 lg:py-32">
          {/* Status badge */}
          <div className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-primary-light/20 bg-primary-light/10 px-4 py-1.5 text-sm font-medium text-primary-light">
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            Independent Security Scanning
          </div>

          {/* Heading */}
          <h1 className="animate-fade-in-up animation-delay-100 mt-6 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
            Discover{" "}
            <span className="bg-gradient-to-r from-sky-400 to-teal-300 bg-clip-text text-transparent">
              Trusted
            </span>{" "}
            OpenClaw Skills
          </h1>

          <p className="animate-fade-in-up animation-delay-200 mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-400">
            Security ratings, user reviews, and curated collections for{" "}
            <span className="font-semibold text-white">
              {total.toLocaleString()}+
            </span>{" "}
            skills. Know what you&apos;re installing.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/quiz"
              className="inline-flex items-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              Start Quiz
            </Link>
            <Link
              href="/security"
              className="inline-flex items-center rounded-lg border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20"
            >
              View Security Report
            </Link>
          </div>

          {/* Search */}
          <div className="animate-fade-in-up animation-delay-300 mx-auto mt-8 max-w-xl">
            <div className="rounded-xl border border-white/10 bg-white/5 p-1.5 backdrop-blur-sm">
              <SearchBar />
            </div>
          </div>

          {/* Category pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {CATEGORIES.slice(0, 6).map((cat) => (
              <Link
                key={cat.value}
                href={`/skills?category=${cat.value}`}
                className="group rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-slate-300 backdrop-blur-sm hover:border-primary-light/30 hover:bg-primary-light/10 hover:text-white"
              >
                <span
                  className={`mr-1.5 inline-block h-2 w-2 rounded-full ${CATEGORY_COLORS[cat.value] || "bg-gray-400"}`}
                />
                {cat.label}
              </Link>
            ))}
          </div>

          {/* Trust stats bar */}
          <div className="mt-10 hidden items-center gap-6 rounded-full border border-white/5 bg-white/5 px-6 py-2.5 text-sm backdrop-blur-sm sm:inline-flex">
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-light" />
              <span className="font-medium text-white">
                {total.toLocaleString()}
              </span>{" "}
              scanned
            </span>
            <span className="h-3 w-px bg-white/10" />
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
              <span className="font-medium text-white">{malicious}</span>{" "}
              flagged
            </span>
            <span className="h-3 w-px bg-white/10" />
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="font-medium text-white">
                {safe.toLocaleString()}
              </span>{" "}
              rated safe
            </span>
          </div>
        </div>
      </section>

      {/* ===== SECURITY DASHBOARD ===== */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Stat: Total Scanned */}
            <Link
              href="/skills"
              className="group rounded-xl border border-border border-l-4 border-l-primary bg-background p-5 hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <svg
                    className="h-5 w-5 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {total.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted">
                    Skills Scanned{" "}
                    <span className="text-primary opacity-0 group-hover:opacity-100">
                      &rarr;
                    </span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Stat: Malicious Flagged */}
            <Link
              href="/skills?grade=D&sort=security"
              className="group rounded-xl border border-red-200 border-l-4 border-l-red-500 bg-red-50 p-5 hover:border-red-400 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                  <svg
                    className="h-5 w-5 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-700">
                    {malicious}
                  </div>
                  <div className="text-xs text-red-600/80">
                    Flagged Dangerous{" "}
                    <span className="text-red-500 opacity-0 group-hover:opacity-100">
                      &rarr;
                    </span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Stat: Risk Percentage */}
            <Link
              href="/skills?grade=C,D&sort=security"
              className="group rounded-xl border border-orange-200 border-l-4 border-l-orange-500 bg-orange-50 p-5 hover:border-orange-400 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                  <svg
                    className="h-5 w-5 text-orange-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-700">
                    {riskPct}%
                  </div>
                  <div className="text-xs text-orange-600/80">
                    Have Risk Flags{" "}
                    <span className="text-orange-500 opacity-0 group-hover:opacity-100">
                      &rarr;
                    </span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Stat: Safe Skills */}
            <Link
              href="/skills?grade=S,A&sort=security"
              className="group rounded-xl border border-emerald-200 border-l-4 border-l-emerald-500 bg-emerald-50 p-5 hover:border-emerald-400 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                  <svg
                    className="h-5 w-5 text-emerald-600"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1 14.5v-2h2v2h-2zm0-4v-6h2v6h-2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-700">
                    {safe.toLocaleString()}
                  </div>
                  <div className="text-xs text-emerald-600/80">
                    Rated Safe (S/A){" "}
                    <span className="text-emerald-500 opacity-0 group-hover:opacity-100">
                      &rarr;
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* CTA row */}
          <div className="mt-5 flex flex-col items-center justify-between gap-4 rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-orange-50 p-5 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100">
                <svg
                  className="h-4 w-4 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div>
                <span className="font-bold text-foreground">
                  ClawHub has no security ratings.
                </span>{" "}
                <span className="text-sm text-muted">
                  We scan every skill so you don&apos;t have to.
                </span>
              </div>
            </div>
            <div className="flex shrink-0 gap-3">
              <Link
                href="/security"
                className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
              >
                View Security Report
              </Link>
              <Link
                href="/skills?sort=security"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark"
              >
                Browse Safest Skills
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CONTENT SECTIONS ===== */}
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {/* Trending This Week */}
        <section>
          <div className="mb-8 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-5 w-1 rounded-full bg-primary" />
                <h2 className="text-2xl font-bold text-foreground">
                  Trending This Week
                </h2>
              </div>
              <p className="mt-1 pl-3 text-sm text-muted">
                Most popular skills in the community right now
              </p>
            </div>
            <Link
              href="/trending"
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:border-primary hover:text-primary"
            >
              View all
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(trending as Skill[] | null)?.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        </section>

        {/* New Arrivals */}
        {newest && newest.length > 0 && (
          <section className="mt-20">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-5 w-1 rounded-full bg-accent" />
                  <h2 className="text-2xl font-bold text-foreground">
                    New Arrivals
                  </h2>
                </div>
                <p className="mt-1 pl-3 text-sm text-muted">
                  Freshly published to the ecosystem
                </p>
              </div>
              <Link
                href="/skills?sort=newest"
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:border-primary hover:text-primary"
              >
                View all
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {(newest as Skill[]).map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ))}
            </div>
          </section>
        )}

        {/* Bottom CTA */}
        <section className="relative mt-20 overflow-hidden rounded-2xl bg-hero-bg">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(14,165,233,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.06) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[100px]" />
          <div className="relative z-10 p-10 text-center sm:p-14">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Share Your OpenClaw Stack
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-400">
              Create your profile, curate your favorite skills, and share it
              with the community.
            </p>
            <a
              href="/api/auth/signin"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 font-semibold text-primary shadow-lg hover:bg-gray-50"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Sign in with GitHub
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
