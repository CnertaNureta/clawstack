import { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SkillCard } from "@/components/skills/SkillCard";
import type { Skill } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Trending OpenClaw Skills",
  description:
    "See what OpenClaw skills are trending this week. Updated daily.",
};

interface Props {
  searchParams: Promise<{ tab?: string }>;
}

export default async function TrendingPage({ searchParams }: Props) {
  const params = await searchParams;
  const tab = params.tab || "trending";
  const supabase = await createClient();

  const tabs = [
    { key: "trending", label: "Trending This Week", sort: "weekly_votes" },
    { key: "popular", label: "Most Popular", sort: "upvotes" },
    { key: "safest", label: "Most Trusted", sort: "security_score" },
    { key: "newest", label: "Newest", sort: "created_at" },
  ];

  const activeTab = tabs.find((t) => t.key === tab) || tabs[0];

  const { data: skills } = await supabase
    .from("skills")
    .select("*")
    .order(activeTab.sort, { ascending: false })
    .limit(50);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-foreground">Rankings</h1>
      <p className="mt-1 text-muted">
        Updated daily. See what the community trusts most.
      </p>

      {/* Tabs */}
      <div className="mt-6 flex gap-2 border-b border-border">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/trending?tab=${t.key}`}
            className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:border-border hover:text-foreground"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* List */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(skills as Skill[] | null)?.map((skill, i) => (
          <div key={skill.id} className="relative">
            <div className="absolute -left-2 -top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
              {i + 1}
            </div>
            <SkillCard skill={skill} />
          </div>
        ))}
      </div>
    </div>
  );
}
