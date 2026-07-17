"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { translateAuthError, validateCredentials } from "@/lib/auth-utils";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { User } from "@/lib/types";

interface AuthResult {
  // Komunikat błędu po polsku, albo null gdy sukces.
  error: string | null;
  // Przy rejestracji: true, jeśli trzeba jeszcze potwierdzić e-mail.
  needsConfirmation?: boolean;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function toUser(session: Session | null): User | null {
  if (!session?.user) return null;
  const email = session.user.email ?? "";
  return {
    id: session.user.id,
    email,
    name: email.split("@")[0] || "Ty",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    void supabase.auth.getSession().then(({ data }) => {
      setUser(toUser(data.session));
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(toUser(session));
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    configured: isSupabaseConfigured,
    async signIn(email, password) {
      if (!supabase) return { error: "Supabase nie jest skonfigurowane." };
      const validationError = validateCredentials(email, password);
      if (validationError) return { error: validationError };
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      return { error: error ? translateAuthError(error.message) : null };
    },
    async signUp(email, password) {
      if (!supabase) return { error: "Supabase nie jest skonfigurowane." };
      const validationError = validateCredentials(email, password);
      if (validationError) return { error: validationError };
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) return { error: translateAuthError(error.message) };
      // Gdy w Supabase włączone jest potwierdzanie e-mail, sesji jeszcze nie ma.
      return { error: null, needsConfirmation: !data.session };
    },
    async signOut() {
      if (supabase) await supabase.auth.signOut();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth musi być użyte wewnątrz AuthProvider");
  return ctx;
}

export { isSupabaseConfigured };
