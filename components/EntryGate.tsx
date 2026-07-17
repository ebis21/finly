"use client";

import Image from "next/image";
import { AuthForm } from "@/components/AuthForm";

export function EntryGate({ onContinueAsGuest }: { onContinueAsGuest: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-mint px-4 py-8">
      <section className="w-full max-w-sm rounded-3xl border-2 border-ink bg-white p-6 shadow-brick-lg">
        <div className="mb-6 text-center">
          <Image src="/logo.png" alt="Logo Finly" width={64} height={64} priority className="mx-auto h-16 w-16 rounded-2xl border-2 border-ink shadow-brick-sm" />
          <h1 className="mt-4 font-display text-3xl font-bold">Witaj w Finly</h1>
          <p className="mt-2 text-sm font-semibold text-ink/60">Zaloguj się, aby korzystać ze swoich danych w chmurze, albo zacznij lokalnie bez konta.</p>
        </div>
        <AuthForm />
        <div className="my-4 flex items-center gap-3 text-xs font-bold text-ink/40"><span className="h-px flex-1 bg-ink/20" />ALBO<span className="h-px flex-1 bg-ink/20" /></div>
        <button type="button" className="w-full rounded-xl border-2 border-ink bg-white px-4 py-3 font-bold shadow-brick-sm" onClick={onContinueAsGuest}>Kontynuuj bez logowania</button>
        <p className="mt-3 text-center text-xs font-semibold text-ink/40">Dane gościa zostaną zapisane tylko na tym urządzeniu.</p>
      </section>
    </main>
  );
}
