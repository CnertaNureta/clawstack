"use client";

import { useState } from "react";

interface RemoveFromStackButtonProps {
  skillId: string;
  onRemoved: () => void;
}

export function RemoveFromStackButton({
  skillId,
  onRemoved,
}: RemoveFromStackButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleRemove = async () => {
    setLoading(true);
    try {
      await fetch("/api/stack", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skill_id: skillId }),
      });
      onRemoved();
    } catch (err) {
      console.error("Remove failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleRemove();
      }}
      disabled={loading}
      className="rounded-md bg-card/80 p-1.5 text-muted shadow-sm backdrop-blur-sm hover:bg-red-50 hover:text-red-600"
      title="Remove from stack"
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
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  );
}
