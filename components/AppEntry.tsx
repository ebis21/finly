"use client";

import { useEffect, useState } from "react";
import { EntryGate } from "@/components/EntryGate";
import { useAuth } from "@/lib/auth";
import { readGuestChoice, rememberGuestChoice, shouldShowEntryGate } from "@/lib/entry-choice";

export function AppEntry({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [hydrated, setHydrated] = useState(false);
  const [guestChosen, setGuestChosen] = useState(false);

  useEffect(() => {
    if (!loading && !user) setGuestChosen(readGuestChoice());
    setHydrated(true);
  }, [loading, user]);

  if (!hydrated || loading) {
    return <main className="flex min-h-screen items-center justify-center bg-mint font-display text-xl font-bold text-ink">Ładuję Finly…</main>;
  }

  if (shouldShowEntryGate(false, Boolean(user), guestChosen)) {
    return <EntryGate onContinueAsGuest={() => { rememberGuestChoice(); setGuestChosen(true); }} />;
  }

  return children;
}
