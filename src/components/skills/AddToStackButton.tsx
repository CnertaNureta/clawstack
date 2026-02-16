"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";

interface AddToStackButtonProps {
  skillId: string;
}

export function AddToStackButton({ skillId }: AddToStackButtonProps) {
  const { user, dbUser, loading: authLoading } = useAuth();
  const [inStack, setInStack] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dbUser) {
      setLoading(false);
      return;
    }

    fetch("/api/stack")
      .then((r) => r.json())
      .then((data) => {
        setInStack(data.skill_ids?.includes(skillId) ?? false);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [dbUser, skillId]);

  const handleToggle = async () => {
    if (!user) {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(window.location.pathname)}`,
          skipBrowserRedirect: true,
        },
      });
      if (!error && data?.url) {
        window.location.href = data.url;
      }
      return;
    }

    setLoading(true);
    try {
      if (inStack) {
        await fetch("/api/stack", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ skill_id: skillId }),
        });
        setInStack(false);
      } else {
        await fetch("/api/stack", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ skill_id: skillId }),
        });
        setInStack(true);
      }
    } catch (err) {
      console.error("Stack toggle failed:", err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold ${
        inStack
          ? "border border-primary bg-primary/10 text-primary hover:bg-primary/20"
          : "bg-primary text-white hover:bg-primary-dark"
      } ${loading ? "cursor-not-allowed opacity-50" : ""}`}
    >
      {inStack ? (
        <>
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
          </svg>
          In My Stack
        </>
      ) : (
        <>
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
          Add to Stack
        </>
      )}
    </button>
  );
}
