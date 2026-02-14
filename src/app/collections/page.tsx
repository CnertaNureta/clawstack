import { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Collection } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Curated OpenClaw Skill Collections",
  description:
    "Hand-picked collections of the best OpenClaw skills for developers, creators, and power users.",
};

export default async function CollectionsPage() {
  const supabase = await createClient();

  const { data: collections } = await supabase
    .from("collections")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-foreground">Collections</h1>
      <p className="mt-1 text-muted">
        Hand-picked skill bundles for every use case.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(collections as Collection[] | null)?.map((col) => (
          <Link
            key={col.id}
            href={`/collections/${col.slug}`}
            className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:bg-card-hover hover:shadow-md"
          >
            <span className="text-4xl">{col.cover_emoji}</span>
            <h2 className="mt-3 text-lg font-semibold text-foreground group-hover:text-primary">
              {col.title}
            </h2>
            <p className="mt-1 text-sm text-muted line-clamp-2">
              {col.description}
            </p>
            <p className="mt-3 text-xs text-muted">
              {col.skill_ids.length} skills
            </p>
          </Link>
        ))}
      </div>

      {(!collections || collections.length === 0) && (
        <div className="mt-8 rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-lg text-muted">Collections coming soon!</p>
        </div>
      )}
    </div>
  );
}
