"use client";

import Image from "next/image";
import { useState } from "react";
import { UserRound } from "lucide-react";
import { AuthForm } from "@/components/AuthForm";
import { FamilyChildPanel } from "@/components/FamilyChildPanel";
import { Modal } from "@/components/Modal";
import { useAuth } from "@/lib/auth";
import { clearGuestChoice } from "@/lib/entry-choice";

export function Header() {
  const { user, loading, signOut } = useAuth();
  const [accountOpen, setAccountOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function logout() {
    setSubmitting(true);
    clearGuestChoice();
    await signOut();
    setSubmitting(false);
    setAccountOpen(false);
  }

  return (
    <header className="flex items-center gap-2.5 px-4 py-4">
      <Image src="/logo.png" alt="Logo Finly — zielony klocek z monetą" width={40} height={40} priority className="h-10 w-10 rounded-xl border-2 border-ink object-cover shadow-brick-sm" />
      <span className="font-display text-2xl font-bold">Finly</span>
      <button type="button" aria-label="Twoje konto" onClick={() => setAccountOpen(true)} className="brick-press ml-auto flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink bg-white text-ink shadow-brick-sm hover:bg-paper"><UserRound className="h-5 w-5" /></button>
      {accountOpen && (
        <Modal title="Twoje konto" onClose={() => setAccountOpen(false)}>
          {loading ? <p className="py-6 text-center font-semibold text-ink/60">Sprawdzam sesję…</p> : user ? (
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl border-2 border-ink bg-paper p-4 text-center"><p className="font-display text-lg font-bold">{user.name}</p><p className="mt-1 text-sm font-semibold text-ink/50">{user.email}</p><p className="mt-3 text-xs font-semibold text-emerald-700">Dane synchronizują się z Supabase.</p></div>
              <FamilyChildPanel />
              <button type="button" className="btn-primary" disabled={submitting} onClick={logout}>{submitting ? "Wylogowuję…" : "Wyloguj się"}</button>
            </div>
          ) : <AuthForm onSuccess={() => setAccountOpen(false)} />}
        </Modal>
      )}
    </header>
  );
}
