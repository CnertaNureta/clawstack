"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CATEGORIES, type Category } from "@/lib/supabase/types";

function CategoryFilterInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") as Category | null;

  const handleSelect = (category: Category | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }
    params.delete("page");
    router.push(`/skills?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => handleSelect(null)}
        className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
          !activeCategory
            ? "bg-primary text-white"
            : "bg-card text-muted hover:bg-card-hover hover:text-foreground"
        }`}
      >
        All
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          onClick={() => handleSelect(cat.value)}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
            activeCategory === cat.value
              ? "bg-primary text-white"
              : "bg-card text-muted hover:bg-card-hover hover:text-foreground"
          }`}
        >
          {cat.emoji} {cat.label}
        </button>
      ))}
    </div>
  );
}

export function CategoryFilter() {
  return (
    <Suspense fallback={<div className="h-10" />}>
      <CategoryFilterInner />
    </Suspense>
  );
}
