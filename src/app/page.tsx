import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SkillCard } from "@/components/skills/SkillCard";
import { SearchBar } from "@/components/layout/SearchBar";
import { CATEGORIES, type Skill } from "@/lib/supabase/types";

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

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-primary-light py-24">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
            Discover <span className="text-accent">Trusted</span> OpenClaw Skills
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/80">
            Security ratings, user reviews, and curated collections for{" "}
            <span className="font-semibold text-white">{totalCount ? totalCount.toLocaleString() : "6,400"}+</span> skills.
            Know what you&apos;re installing.
          </p>
          <div className="mx-auto mt-8 max-w-xl">
            <SearchBar />
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {CATEGORIES.slice(0, 6).map((cat) => (
              <Link
                key={cat.value}
                href={`/skills?category=${cat.value}`}
                className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm hover:bg-white/20 hover:text-white"
              >
                {cat.emoji} {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Security callout */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-danger/10">
              <svg className="h-6 w-6 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                341 malicious skills found on ClawHub
              </h2>
              <p className="text-sm text-muted">
                We scan every skill for security risks so you don&apos;t have to.
              </p>
            </div>
          </div>
          <Link
            href="/skills?sort=security"
            className="shrink-0 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark"
          >
            Browse Safest Skills
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {/* Trending This Week */}
        <section>
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Trending This Week
              </h2>
              <p className="mt-1 text-sm text-muted">Most popular skills in the community right now</p>
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
                <h2 className="text-2xl font-bold text-foreground">
                  New Arrivals
                </h2>
                <p className="mt-1 text-sm text-muted">Freshly published to the ecosystem</p>
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

        {/* CTA */}
        <section className="mt-20 overflow-hidden rounded-2xl bg-gradient-to-r from-primary-dark via-primary to-primary-light p-10 text-center sm:p-14">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Share Your OpenClaw Stack
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/80">
            Create your profile, curate your favorite skills, and share it with
            the community.
          </p>
          <Link
            href="/api/auth/callback?provider=github"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 font-semibold text-primary shadow-lg hover:bg-gray-50"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            Sign in with GitHub
          </Link>
        </section>
      </div>
    </div>
  );
}
