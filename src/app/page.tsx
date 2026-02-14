import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SkillCard } from "@/components/skills/SkillCard";
import { SecurityBadge } from "@/components/skills/SecurityBadge";
import { SearchBar } from "@/components/layout/SearchBar";
import { CATEGORIES, type Skill } from "@/lib/supabase/types";

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch trending skills (this week)
  const { data: trending } = await supabase
    .from("skills")
    .select("*")
    .order("weekly_votes", { ascending: false })
    .limit(6);

  // Fetch most secure skills
  const { data: safest } = await supabase
    .from("skills")
    .select("*")
    .eq("security_grade", "S")
    .order("upvotes", { ascending: false })
    .limit(6);

  // Fetch newest skills
  const { data: newest } = await supabase
    .from("skills")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(6);

  // Total skill count
  const { count: totalCount } = await supabase
    .from("skills")
    .select("*", { count: "exact", head: true });

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-primary-light py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Discover <span className="text-accent">Trusted</span> OpenClaw
            Skills
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
            Security ratings, user reviews, and curated collections for{" "}
            {totalCount ? totalCount.toLocaleString() : "5,700"}+ skills. Know
            what you&apos;re installing.
          </p>
          <div className="mx-auto mt-8 max-w-xl">
            <SearchBar />
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {CATEGORIES.slice(0, 6).map((cat) => (
              <Link
                key={cat.value}
                href={`/skills?category=${cat.value}`}
                className="rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/25"
              >
                {cat.emoji} {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Security callout */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🛡️</span>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                341 malicious skills found on ClawHub
              </h2>
              <p className="text-sm text-muted">
                We scan every skill for security risks so you don&apos;t have
                to.
              </p>
            </div>
          </div>
          <Link
            href="/skills?sort=security"
            className="shrink-0 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Browse Safest Skills
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Trending This Week */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">
              Trending This Week
            </h2>
            <Link
              href="/trending"
              className="text-sm font-medium text-primary hover:underline"
            >
              View all &rarr;
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(trending as Skill[] | null)?.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        </section>

        {/* Most Secure */}
        {safest && safest.length > 0 && (
          <section className="mt-16">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-foreground">
                  Most Secure
                </h2>
                <SecurityBadge grade="S" size="md" />
              </div>
              <Link
                href="/skills?security_grade=S"
                className="text-sm font-medium text-primary hover:underline"
              >
                View all &rarr;
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(safest as Skill[]).map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ))}
            </div>
          </section>
        )}

        {/* New Arrivals */}
        {newest && newest.length > 0 && (
          <section className="mt-16">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">
                New Arrivals
              </h2>
              <Link
                href="/skills?sort=newest"
                className="text-sm font-medium text-primary hover:underline"
              >
                View all &rarr;
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(newest as Skill[]).map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="mt-16 rounded-2xl bg-gradient-to-r from-primary to-primary-light p-8 text-center sm:p-12">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Share Your OpenClaw Stack
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/80">
            Create your profile, curate your favorite skills, and share it with
            the community.
          </p>
          <Link
            href="/api/auth/callback?provider=github"
            className="mt-6 inline-block rounded-lg bg-white px-8 py-3 font-semibold text-primary hover:bg-gray-100"
          >
            Sign in with GitHub
          </Link>
        </section>
      </div>
    </div>
  );
}
