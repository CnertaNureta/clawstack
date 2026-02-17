import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SecurityBadge } from "@/components/skills/SecurityBadge";
import { InstallCommand } from "@/components/skills/InstallCommand";
import { SkillCard } from "@/components/skills/SkillCard";
import { CATEGORIES, SECURITY_GRADES } from "@/lib/supabase/types";
import type { Skill, Review } from "@/lib/supabase/types";
import { AddToStackButton } from "@/components/skills/AddToStackButton";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: skill } = await supabase
    .from("skills")
    .select("name, description, security_grade, install_command")
    .eq("slug", slug)
    .single();

  if (!skill) return { title: "Skill Not Found" };

  return {
    title: `${skill.name} — Safety ${skill.security_grade || "Unrated"}`,
    description: `${skill.description || skill.name}. Security grade: ${skill.security_grade || "Unrated"}. ${skill.install_command ? `Install: ${skill.install_command}` : ""}`,
    openGraph: {
      title: `${skill.name} for OpenClaw`,
      description: skill.description || skill.name,
      images: [`/api/og?type=skill&slug=${slug}`],
    },
  };
}

const scoreMaxMap: Record<string, number> = {
  networkScore: 15,
  communityScore: 10,
  permissionScore: 20,
  scanScore: 30,
  virusTotalScore: 30,
  authorTrustScore: 15,
  auditabilityScore: 10,
};

const scoreLabelMap: Record<string, string> = {
  networkScore: "Network Safety",
  communityScore: "Community Trust",
  permissionScore: "Permissions",
  scanScore: "Security Scan",
  virusTotalScore: "Security Scan",
  authorTrustScore: "Author Reputation",
  auditabilityScore: "Auditability",
};

function getBarColor(value: number, max: number) {
  const pct = value / max;
  if (pct >= 0.8) return "bg-emerald-500";
  if (pct >= 0.6) return "bg-green-500";
  if (pct >= 0.4) return "bg-yellow-500";
  if (pct >= 0.2) return "bg-orange-500";
  return "bg-red-500";
}

export default async function SkillDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: skill } = await supabase
    .from("skills")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!skill) notFound();

  const typedSkill = skill as Skill;

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, user:users(username, avatar_url)")
    .eq("skill_id", skill.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: similarSkills } = await supabase
    .from("skills")
    .select("*")
    .eq("category", skill.category)
    .neq("id", skill.id)
    .order("upvotes", { ascending: false })
    .limit(3);

  const categoryInfo = CATEGORIES.find((c) => c.value === typedSkill.category);
  const gradeInfo = SECURITY_GRADES.find(
    (g) => g.grade === typedSkill.security_grade
  );

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://clawstack.sh";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: typedSkill.name,
    description: typedSkill.description || typedSkill.name,
    applicationCategory: categoryInfo?.label || typedSkill.category,
    operatingSystem: "OpenClaw",
    author: typedSkill.author_name
      ? { "@type": "Person", name: typedSkill.author_name }
      : undefined,
    aggregateRating:
      typedSkill.review_count > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: typedSkill.avg_rating,
            reviewCount: typedSkill.review_count,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
    url: `${baseUrl}/skills/${typedSkill.slug}`,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted">
        <Link href="/skills" className="hover:text-primary">
          Skills
        </Link>
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
        <Link
          href={`/skills?category=${typedSkill.category}`}
          className="hover:text-primary"
        >
          {categoryInfo?.label || typedSkill.category}
        </Link>
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
        <span className="font-medium text-foreground">{typedSkill.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                    {typedSkill.name}
                  </h1>
                  <SecurityBadge
                    grade={typedSkill.security_grade}
                    size="lg"
                    showLabel
                  />
                </div>
                <p className="mt-2 text-sm text-muted">
                  {categoryInfo?.emoji} {categoryInfo?.label}
                  {typedSkill.author_name && (
                    <> &middot; by <span className="font-medium text-foreground">{typedSkill.author_name}</span></>
                  )}
                </p>
              </div>
              <div className="shrink-0 text-center">
                <div className="flex items-center gap-1.5">
                  <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                  </svg>
                  <span className="text-2xl font-bold text-foreground">{typedSkill.upvotes}</span>
                </div>
                <div className="text-xs text-muted">upvotes</div>
              </div>
            </div>

            <p className="mt-4 leading-relaxed text-foreground/80">
              {typedSkill.description || "No description available."}
            </p>

            {/* Tags */}
            {typedSkill.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {typedSkill.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-primary/5 px-3 py-1 text-xs font-medium text-primary-dark"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Install */}
            {typedSkill.install_command && (
              <div className="mt-6">
                <h2 className="mb-2 text-sm font-semibold text-foreground">
                  Install
                </h2>
                <InstallCommand command={typedSkill.install_command} />
              </div>
            )}
          </div>

          {/* ClawHub comparison callout */}
          <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/[0.03] p-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  On ClawHub, this skill has no security information.
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  ClawStack independently scans every skill for permissions, network requests, author reputation, and more.{" "}
                  <Link href="/security" className="font-medium text-primary hover:underline">
                    Learn how we score &rarr;
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Security Details */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">
                Security Analysis
              </h2>
              {typedSkill.security_grade && (
                <span className="text-sm text-muted">
                  Score: <span className="font-semibold text-foreground">{typedSkill.security_score}</span>/100
                </span>
              )}
            </div>
            {typedSkill.security_grade ? (
              <div className="mt-5">
                <div className="mb-5 flex items-center gap-3">
                  <SecurityBadge
                    grade={typedSkill.security_grade}
                    size="lg"
                    showLabel
                  />
                </div>
                {typedSkill.security_details &&
                  Object.keys(typedSkill.security_details).length > 0 && (
                    <div className="space-y-4">
                      {Object.entries(typedSkill.security_details)
                        .filter(([key]) => key in scoreMaxMap)
                        .map(([key, value]) => {
                          const max = scoreMaxMap[key] || 30;
                          const pct = Math.min(((value as number) / max) * 100, 100);
                          return (
                            <div key={key}>
                              <div className="mb-1.5 flex justify-between text-sm">
                                <span className="font-medium text-foreground">
                                  {scoreLabelMap[key] || key.replace(/([A-Z])/g, " $1").trim()}
                                </span>
                                <span className="tabular-nums text-muted">
                                  {value as number}/{max}
                                </span>
                              </div>
                              <div className="h-2.5 overflow-hidden rounded-full bg-border/50">
                                <div
                                  className={`h-full rounded-full ${getBarColor(value as number, max)}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  )}
              </div>
            ) : (
              <div className="mt-4 flex items-center gap-3 rounded-lg bg-background p-4">
                <svg className="h-5 w-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <p className="text-sm text-muted">
                  This skill has not been security-rated yet.
                </p>
              </div>
            )}
          </div>

          {/* Reviews */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground">
              Reviews ({typedSkill.review_count})
            </h2>
            {reviews && reviews.length > 0 ? (
              <div className="mt-4 space-y-4">
                {reviews.map((review: Review & { user?: { username: string; avatar_url: string } }) => (
                  <div
                    key={review.id}
                    className="border-b border-border/50 pb-4 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {review.user?.username ?? "Anonymous"}
                      </span>
                      <span className="text-sm text-accent">
                        {"★".repeat(review.rating)}
                        <span className="text-border">{"★".repeat(5 - review.rating)}</span>
                      </span>
                    </div>
                    {review.comment && (
                      <p className="mt-1 text-sm leading-relaxed text-muted">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 flex flex-col items-center rounded-lg bg-background py-8 text-center">
                <svg className="h-10 w-10 text-border" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                <p className="mt-3 text-sm font-medium text-muted">No reviews yet</p>
                <p className="mt-1 text-xs text-muted/70">Be the first to review this skill!</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Add to Stack */}
          <AddToStackButton skillId={typedSkill.id} />

          {/* Quick info */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-sm font-bold text-foreground">Details</h3>
            <dl className="mt-4 space-y-4 text-sm">
              {typedSkill.author_github && (
                <div className="flex items-center justify-between">
                  <dt className="text-muted">Author</dt>
                  <dd>
                    <a
                      href={`https://github.com/${typedSkill.author_github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline"
                    >
                      @{typedSkill.author_github}
                    </a>
                  </dd>
                </div>
              )}
              {typedSkill.repo_url && (
                <div className="flex items-center justify-between">
                  <dt className="text-muted">Source</dt>
                  <dd>
                    <a
                      href={typedSkill.repo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline"
                    >
                      GitHub
                    </a>
                  </dd>
                </div>
              )}
              {typedSkill.clawhub_url && (
                <div className="flex items-center justify-between">
                  <dt className="text-muted">ClawHub</dt>
                  <dd>
                    <a
                      href={typedSkill.clawhub_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline"
                    >
                      View
                    </a>
                  </dd>
                </div>
              )}
              <div className="flex items-center justify-between">
                <dt className="text-muted">Category</dt>
                <dd className="font-medium text-foreground">
                  {categoryInfo?.emoji} {categoryInfo?.label}
                </dd>
              </div>
              {typedSkill.avg_rating > 0 && (
                <div className="flex items-center justify-between">
                  <dt className="text-muted">Rating</dt>
                  <dd className="font-medium text-foreground">
                    <span className="text-accent">★</span> {typedSkill.avg_rating.toFixed(1)} ({typedSkill.review_count})
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Similar skills */}
          {similarSkills && similarSkills.length > 0 && (
            <div>
              <h3 className="mb-4 text-sm font-bold text-foreground">
                Similar Skills
              </h3>
              <div className="space-y-3">
                {(similarSkills as Skill[]).map((s) => (
                  <SkillCard key={s.id} skill={s} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
