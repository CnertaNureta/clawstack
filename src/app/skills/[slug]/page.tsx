import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SecurityBadge } from "@/components/skills/SecurityBadge";
import { InstallCommand } from "@/components/skills/InstallCommand";
import { SkillCard } from "@/components/skills/SkillCard";
import { CATEGORIES, SECURITY_GRADES } from "@/lib/supabase/types";
import type { Skill, Review } from "@/lib/supabase/types";

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
      images: [
        `/api/og?type=skill&slug=${slug}`,
      ],
    },
  };
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

  // Fetch reviews
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, user:users(username, avatar_url)")
    .eq("skill_id", skill.id)
    .order("created_at", { ascending: false })
    .limit(20);

  // Fetch similar skills
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted">
        <Link href="/skills" className="hover:text-foreground">
          Skills
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/skills?category=${typedSkill.category}`}
          className="hover:text-foreground"
        >
          {categoryInfo?.label || typedSkill.category}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{typedSkill.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Header */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-foreground">
                    {typedSkill.name}
                  </h1>
                  <SecurityBadge
                    grade={typedSkill.security_grade}
                    size="lg"
                    showLabel
                  />
                </div>
                <p className="mt-1 text-sm text-muted">
                  {categoryInfo?.emoji} {categoryInfo?.label} &middot;
                  {typedSkill.author_name && ` by ${typedSkill.author_name}`}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-foreground">
                  {typedSkill.upvotes}
                </div>
                <div className="text-xs text-muted">upvotes</div>
              </div>
            </div>

            <p className="mt-4 text-foreground">
              {typedSkill.description || "No description available."}
            </p>

            {/* Tags */}
            {typedSkill.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {typedSkill.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-background px-3 py-1 text-xs text-muted"
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

          {/* Security Details */}
          <div className="mt-6 rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">
              Security Analysis
            </h2>
            {typedSkill.security_grade ? (
              <div className="mt-4">
                <div className="mb-4 flex items-center gap-3">
                  <SecurityBadge
                    grade={typedSkill.security_grade}
                    size="lg"
                    showLabel
                  />
                  <span className="text-sm text-muted">
                    Score: {typedSkill.security_score}/100
                  </span>
                </div>
                {typedSkill.security_details &&
                  Object.keys(typedSkill.security_details).length > 0 && (
                    <div className="space-y-3">
                      {Object.entries(typedSkill.security_details).map(
                        ([key, value]) => (
                          <div key={key}>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}
                              </span>
                              <span className="font-medium text-foreground">
                                {value as number}
                              </span>
                            </div>
                            <div className="mt-1 h-2 rounded-full bg-background">
                              <div
                                className="h-2 rounded-full bg-primary"
                                style={{
                                  width: `${Math.min((value as number) * 100 / 30, 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted">
                This skill has not been security-rated yet.
              </p>
            )}
          </div>

          {/* Reviews */}
          <div className="mt-6 rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">
              Reviews ({typedSkill.review_count})
            </h2>
            {reviews && reviews.length > 0 ? (
              <div className="mt-4 space-y-4">
                {reviews.map((review: Review & { user?: { username: string; avatar_url: string } }) => (
                  <div
                    key={review.id}
                    className="border-b border-border pb-4 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {review.user?.username ?? "Anonymous"}
                      </span>
                      <span className="text-sm text-accent">
                        {"★".repeat(review.rating)}
                        {"☆".repeat(5 - review.rating)}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="mt-1 text-sm text-muted">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted">
                No reviews yet. Be the first to review this skill!
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick info */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-sm font-semibold text-foreground">Details</h3>
            <dl className="mt-3 space-y-3 text-sm">
              {typedSkill.author_github && (
                <div>
                  <dt className="text-muted">Author</dt>
                  <dd>
                    <a
                      href={`https://github.com/${typedSkill.author_github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      @{typedSkill.author_github}
                    </a>
                  </dd>
                </div>
              )}
              {typedSkill.repo_url && (
                <div>
                  <dt className="text-muted">Source Code</dt>
                  <dd>
                    <a
                      href={typedSkill.repo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      View on GitHub
                    </a>
                  </dd>
                </div>
              )}
              {typedSkill.clawhub_url && (
                <div>
                  <dt className="text-muted">ClawHub</dt>
                  <dd>
                    <a
                      href={typedSkill.clawhub_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      View on ClawHub
                    </a>
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-muted">Category</dt>
                <dd className="text-foreground">
                  {categoryInfo?.emoji} {categoryInfo?.label}
                </dd>
              </div>
              {typedSkill.avg_rating > 0 && (
                <div>
                  <dt className="text-muted">Rating</dt>
                  <dd className="text-foreground">
                    ★ {typedSkill.avg_rating.toFixed(1)} ({typedSkill.review_count}{" "}
                    reviews)
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Similar skills */}
          {similarSkills && similarSkills.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold text-foreground">
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
