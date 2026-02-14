import Link from "next/link";
import { Skill, CATEGORIES, SecurityGrade } from "@/lib/supabase/types";
import { SecurityBadge } from "./SecurityBadge";

function gradeLeftBorder(grade: SecurityGrade | null): string {
  switch (grade) {
    case "S": return "border-l-emerald-500";
    case "A": return "border-l-green-500";
    case "B": return "border-l-yellow-500";
    case "C": return "border-l-orange-500";
    case "D": return "border-l-red-500";
    default:  return "border-l-gray-300";
  }
}

interface SkillCardProps {
  skill: Skill;
  rank?: number;
}

export function SkillCard({ skill, rank }: SkillCardProps) {
  const categoryInfo = CATEGORIES.find((c) => c.value === skill.category);

  return (
    <Link
      href={`/skills/${skill.slug}`}
      className={`group relative flex flex-col rounded-xl border border-border border-l-4 ${gradeLeftBorder(skill.security_grade)} bg-card p-5 shadow-sm hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5`}
      style={{ transition: "transform 150ms ease, box-shadow 150ms ease" }}
    >
      {/* Rank badge */}
      {rank && (
        <div className="absolute -left-2.5 -top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-xs font-bold text-white shadow-md">
          {rank}
        </div>
      )}

      {/* Top row: category + security */}
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted">
          {categoryInfo?.emoji} {categoryInfo?.label ?? skill.category}
        </span>
        <SecurityBadge grade={skill.security_grade} size="sm" />
      </div>

      {/* Name */}
      <h3 className="mt-3 text-base font-bold text-foreground group-hover:text-primary">
        {skill.name}
      </h3>

      {/* Description */}
      <p className="mt-1.5 line-clamp-2 flex-1 text-sm leading-relaxed text-muted">
        {skill.description || "No description available."}
      </p>

      {/* Tags */}
      {skill.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {skill.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-primary/5 px-2 py-0.5 text-xs font-medium text-primary-dark"
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
      <div className="mt-4 flex items-center gap-4 border-t border-border/60 pt-3 text-xs text-muted">
        <span className="flex items-center gap-1 font-medium text-foreground">
          <svg className="h-3.5 w-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
          </svg>
          {skill.upvotes}
        </span>
        {skill.review_count > 0 && (
          <span className="flex items-center gap-1">
            <span className="text-accent">★</span> {skill.avg_rating.toFixed(1)}
            <span className="text-muted/60">({skill.review_count})</span>
          </span>
        )}
        {skill.author_name && (
          <span className="ml-auto truncate text-muted/80">by {skill.author_name}</span>
        )}
      </div>
    </Link>
  );
}
