"use client";

import { useState } from "react";
import Link from "next/link";
import { SkillCard } from "./SkillCard";
import { RemoveFromStackButton } from "./RemoveFromStackButton";
import type { Skill } from "@/lib/supabase/types";

interface EditableStackGridProps {
  initialSkills: Skill[];
  isOwner: boolean;
}

export function EditableStackGrid({
  initialSkills,
  isOwner,
}: EditableStackGridProps) {
  const [skills, setSkills] = useState(initialSkills);

  const handleRemoved = (skillId: string) => {
    setSkills((prev) => prev.filter((s) => s.id !== skillId));
  };

  if (skills.length === 0) {
    return (
      <div className="mt-8 rounded-xl border border-border bg-card p-12 text-center">
        <svg
          className="mx-auto h-12 w-12 text-border"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
        <p className="mt-4 text-lg font-medium text-muted">
          {isOwner ? "Your stack is empty" : "This stack is empty"}
        </p>
        {isOwner && (
          <Link
            href="/skills"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Browse Skills
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {skills.map((skill) => (
        <div key={skill.id} className="relative">
          <SkillCard skill={skill} />
          {isOwner && (
            <div className="absolute right-2 top-2 z-10">
              <RemoveFromStackButton
                skillId={skill.id}
                onRemoved={() => handleRemoved(skill.id)}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
