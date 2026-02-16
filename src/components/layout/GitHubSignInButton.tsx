"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";

export function GitHubSignInButton({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const { dbUser } = useAuth();
  const [signingIn, setSigningIn] = useState(false);

  if (dbUser) {
    return (
      <Link href={`/u/${dbUser.username}`} className={className}>
        View My Stack
      </Link>
    );
  }

  const handleSignIn = async () => {
    setSigningIn(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
          skipBrowserRedirect: true,
        },
      });
      if (error) {
        console.error("OAuth error:", error);
        setSigningIn(false);
        return;
      }
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Sign in error:", err);
      setSigningIn(false);
    }
  };

  return (
    <button onClick={handleSignIn} disabled={signingIn} className={className}>
      {signingIn ? "Signing in..." : children}
    </button>
  );
}
