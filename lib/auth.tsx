"use client";

import { createContext, useContext } from "react";
import type { User } from "@/lib/types";

// Zaślepka pod przyszłe logowanie (np. Supabase Auth).
// W MVP aplikacja działa lokalnie bez kont, więc user jest zawsze null;
// komponenty korzystają już z useAuth, żeby podłączenie prawdziwego
// logowania nie wymagało ich przebudowy.
interface AuthContextValue {
  user: User | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  async signIn() {},
  async signOut() {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const value: AuthContextValue = {
    user: null,
    async signIn() {
      // TODO(etap kont): prawdziwe logowanie przez adapter bazy
    },
    async signOut() {},
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
