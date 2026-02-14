import Link from "next/link";
import { Skill, CATEGORIES } from "@/lib/supabase/types";
import { SecurityBadge } from "./SecurityBadge";

interface SkillCardProps {
  skill: Skill;
}

export function SkillCard({ skill }: SkillCardProps) {
  const categoryInfo = CATEGORIES.find((c) => c.value === skill.category);

  return (
    <Link
      href={`/skills/${skill.slug}`}
      className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:bg-card-hover hover:shadow-md"
    >
      {/* Top row: category + security */}
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1 text-xs font-medium text-muted">
          {categoryInfo?.emoji} {categoryInfo?.label ?? skill.category}
        </span>
        <SecurityBadge grade={skill.security_grade} size="sm" />
      </div>

      {/* Name */}
      <h3 className="mt-3 text-lg font-semibold text-foreground group-hover:text-primary">
        {skill.name}
      </h3>

      {/* Description */}
      <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-muted">
        {skill.description || "No description available."}
      </p>

      {/* Tags */}
      {skill.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {skill.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-background px-2 py-0.5 text-xs text-muted"
            >
              {tag}
            </span>
          ))}
          {skill.tags.length > 3 && (
            <span className="text-xs text-muted">+{skill.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Bottom: stats */}
      <div className="mt-4 flex items-center gap-4 border-t border-border pt-3 text-xs text-muted">
        <span className="flex items-center gap-1">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
          {skill.upvotes}
        </span>
        {skill.review_count > 0 && (
          <span className="flex items-center gap-1">
            ★ {skill.avg_rating.toFixed(1)} ({skill.review_count})
          </span>
        )}
        {skill.author_name && (
          <span className="ml-auto truncate">by {skill.author_name}</span>
        )}
      </div>
    </Link>
  );
}
