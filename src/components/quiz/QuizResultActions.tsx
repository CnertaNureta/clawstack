"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { trackEvent } from "@/lib/analytics";

interface QuizResultActionsProps {
  resultPath: string;
  resultLink: string;
  resultId: string;
  skillCount: number;
  isAnonymous: boolean;
}

export default function QuizResultActions({
  resultPath,
  resultLink,
  resultId,
  skillCount,
  isAnonymous,
}: QuizResultActionsProps) {
  const { user, dbUser, loading } = useAuth();
  const [copied, setCopied] = useState(false);

  const signInHref = `/api/auth/signin?next=${encodeURIComponent(resultPath)}`;
  const saveLabel = user
    ? "Save to My Stack"
    : "Sign in to save your result";

  const stackHref = user && dbUser ? `/u/${dbUser.username}` : null;
  const missingProfileHref = user ? `/api/auth/signin?next=${encodeURIComponent(resultPath)}` : null;

  const shareTweet =
    `I got ${skillCount} personalized OpenClaw recommendations. See yours at:`;

  const shareHref = `https://twitter.com/intent/tweet?${new URLSearchParams({
    text: shareTweet,
    url: resultLink,
  }).toString()}`;

  const handleSignupClick = () => {
    trackEvent("signup_after_quiz", {
      quiz_id: resultId,
      anonymous: isAnonymous,
      result_count: skillCount,
    });
  };

  const handleShareClick = () => {
    trackEvent("share_click", {
      quiz_id: resultId,
      method: "x",
      result_count: skillCount,
      anonymous: isAnonymous,
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(resultLink);
      setCopied(true);
      trackEvent("share_click", {
        quiz_id: resultId,
        method: "copy_link",
        result_count: skillCount,
        anonymous: isAnonymous,
      });
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // no-op
    }
  };

  return (
    <div className="mt-12 space-y-4">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <Link
          href="/quiz"
          className="rounded-lg border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-card-hover"
        >
          Retake Quiz
        </Link>

        {loading ? (
          <span className="inline-flex items-center rounded-lg border border-border bg-card px-6 py-3 text-sm font-semibold text-muted">
            Checking account...
          </span>
        ) : !user ? (
          <a
            href={signInHref}
            onClick={handleSignupClick}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
            aria-label={saveLabel}
          >
            Sign in to save
          </a>
        ) : stackHref ? (
          <Link
            href={stackHref}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
            aria-label={saveLabel}
          >
            Save to My Stack
          </Link>
        ) : (
          <a
            href={missingProfileHref ?? signInHref}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
            aria-label={saveLabel}
          >
            Finish sign in
          </a>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <h3 className="text-sm font-bold text-foreground">Share your results</h3>
        <p className="mt-1 text-sm text-muted">
          Share this result link with friends or teams.
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <input
            type="text"
            readOnly
            value={resultLink}
            aria-label="Quiz result share link"
            className="w-full max-w-md rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-card-hover"
            aria-label="Copy quiz result link"
          >
            {copied ? "Copied" : "Copy Link"}
          </button>
        </div>

        <div className="mt-4 flex items-center justify-center">
          <a
            href={shareHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleShareClick}
            className="inline-flex items-center gap-2 rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-black/90"
            aria-label="Share result on X"
          >
            <svg
              className="h-4 w-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M18.244 2.25H21l-6.47 7.394L22.5 21.75h-6.91l-5.42-7.06-6.2 7.06H1.24l7.03-8.013L.75 2.25h7.09L12.56 8.75 18.244 2.25Zm-2.42 17.25h1.95L7.9 4.5H5.8l10.024 14.999Z" />
            </svg>
            Share on X
          </a>
        </div>

        <p
          aria-live="polite"
          className="mt-2 text-xs text-muted"
        >
          {copied ? "Result link copied." : "This link is shareable."}
        </p>
      </div>
    </div>
  );
}
