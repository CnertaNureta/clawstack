"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface DbUser {
  id: string;
  username: string;
  avatar_url: string | null;
}

interface AuthContextType {
  user: User | null;
  dbUser: DbUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  dbUser: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user);
      if (user) {
        const githubId = user.user_metadata?.user_name || user.id;
        const { data } = await supabase
          .from("users")
          .select("id, username, avatar_url")
          .eq("github_id", githubId)
          .single();

        if (data) {
          setDbUser(data as DbUser);
        } else {
          // User record missing — create via server API (bypasses RLS)
          try {
            const res = await fetch("/api/auth/ensure-user", { method: "POST" });
            if (res.ok) {
              const created = await res.json();
              setDbUser(created as DbUser);
            }
          } catch {
            // ignore — user will see Sign In button
          }
        }
        setLoading(false);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setDbUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setDbUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, dbUser, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
