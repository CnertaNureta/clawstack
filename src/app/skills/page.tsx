import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { SkillCard } from "@/components/skills/SkillCard";
import { CategoryFilter } from "@/components/skills/CategoryFilter";
import { Skill, Category, SecurityGrade } from "@/lib/supabase/types";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Browse All OpenClaw Skills",
  description:
    "Discover 5,700+ OpenClaw skills with security ratings. Filter by category, sort by popularity or safety.",
};

interface Props {
  searchParams: Promise<{
    q?: string;
    category?: Category;
    security_grade?: SecurityGrade;
    sort?: string;
    page?: string;
  }>;
}

export default async function SkillsPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = params.q;
  const category = params.category;
  const securityGrade = params.security_grade;
  const sort = params.sort || "upvotes";
  const page = parseInt(params.page || "1");
  const limit = 24;

  const supabase = await createClient();

  let query = supabase.from("skills").select("*", { count: "exact" });

  if (q) {
    query = query.textSearch("fts", q, { type: "websearch" });
  }
  if (category) {
    query = query.eq("category", category);
  }
  if (securityGrade) {
    query = query.eq("security_grade", securityGrade);
  }

  switch (sort) {
    case "security":
      query = query.order("security_score", { ascending: false });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "trending":
      query = query.order("weekly_votes", { ascending: false });
      break;
    default:
      query = query.order("upvotes", { ascending: false });
  }

  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data: skills, count } = await query;
  const totalPages = Math.ceil((count || 0) / limit);

  const sortOptions = [
    { value: "upvotes", label: "Most Popular" },
    { value: "security", label: "Most Secure" },
    { value: "trending", label: "Trending" },
    { value: "newest", label: "Newest" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">
          {q ? `Results for "${q}"` : "All OpenClaw Skills"}
        </h1>
        <p className="mt-1 text-muted">
          {count ?? 0} skills found
          {category ? ` in ${category}` : ""}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <CategoryFilter />
      </div>

      {/* Sort */}
      <div className="mb-6 flex items-center gap-2">
        <span className="text-sm text-muted">Sort by:</span>
        {sortOptions.map((opt) => {
          const params = new URLSearchParams();
          if (q) params.set("q", q);
          if (category) params.set("category", category);
          params.set("sort", opt.value);

          return (
            <Link
              key={opt.value}
              href={`/skills?${params.toString()}`}
              className={`rounded-md px-3 py-1 text-sm ${
                sort === opt.value
                  ? "bg-primary text-white"
                  : "text-muted hover:bg-card-hover hover:text-foreground"
              }`}
            >
              {opt.label}
            </Link>
          );
        })}
      </div>

      {/* Grid */}
      {skills && skills.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(skills as Skill[]).map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-lg text-muted">No skills found.</p>
          <p className="mt-2 text-sm text-muted">
            Try adjusting your search or filters.
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/skills?${new URLSearchParams({
                ...(q ? { q } : {}),
                ...(category ? { category } : {}),
                sort,
                page: String(page - 1),
              }).toString()}`}
              className="rounded-md border border-border px-4 py-2 text-sm hover:bg-card-hover"
            >
              Previous
            </Link>
          )}
          <span className="text-sm text-muted">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/skills?${new URLSearchParams({
                ...(q ? { q } : {}),
                ...(category ? { category } : {}),
                sort,
                page: String(page + 1),
              }).toString()}`}
              className="rounded-md border border-border px-4 py-2 text-sm hover:bg-card-hover"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
