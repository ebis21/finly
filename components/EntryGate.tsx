"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { AuthForm } from "@/components/AuthForm";
import type { Role } from "@/lib/types";

type Step = { kind: "choose" } | { kind: "signup"; role: Role } | { kind: "signin" };

export function EntryGate({ onContinueAsGuest }: { onContinueAsGuest: () => void }) {
  const [step, setStep] = useState<Step>({ kind: "choose" });

  return (
    <main className="flex min-h-screen items-center justify-center bg-mint px-4 py-8">
      <section className="w-full max-w-sm rounded-3xl border-2 border-ink bg-white p-6 shadow-brick-lg">
        <div className="mb-6 text-center">
          <Image src="/logo.png" alt="Logo Finly" width={64} height={64} priority className="mx-auto h-16 w-16 rounded-2xl border-2 border-ink shadow-brick-sm" />
          <h1 className="mt-4 font-display text-3xl font-bold">Witaj w Finly</h1>
          {step.kind === "choose" && (
            <p className="mt-2 text-sm font-semibold text-ink/60">
              Kim jesteś? Wybierz, żeby założyć konto.
            </p>
          )}
        </div>

        {step.kind === "choose" ? (
          <div className="flex flex-col gap-3">
            <RoleCard
              emoji="🧒"
              title="Jestem dzieckiem"
              desc="Prowadzisz swój portfel. Możesz połączyć się z rodzicem (pokażesz mu kod) — będzie podglądać Twój portfel, ale nic w nim nie zmieni."
              onClick={() => setStep({ kind: "signup", role: "child" })}
            />
            <RoleCard
              emoji="🧑‍🍼"
              title="Jestem rodzicem"
              desc="Masz swój, osobny portfel oraz podgląd portfeli swoich dzieci — tylko do odczytu (widzisz wszystko, nic nie zmieniasz)."
              onClick={() => setStep({ kind: "signup", role: "parent" })}
            />

            <button
              type="button"
              onClick={() => setStep({ kind: "signin" })}
              className="mt-1 text-center text-sm font-bold text-brand-dark underline"
            >
              Mam już konto — zaloguj się
            </button>

            <div className="my-1 flex items-center gap-3 text-xs font-bold text-ink/40">
              <span className="h-px flex-1 bg-ink/20" />ALBO<span className="h-px flex-1 bg-ink/20" />
            </div>
            <button type="button" className="w-full rounded-xl border-2 border-ink bg-white px-4 py-3 font-bold shadow-brick-sm" onClick={onContinueAsGuest}>
              Kontynuuj bez logowania
            </button>
            <p className="text-center text-xs font-semibold text-ink/40">
              Dane gościa zostaną zapisane tylko na tym urządzeniu.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => setStep({ kind: "choose" })}
              className="flex items-center gap-1 self-start text-sm font-bold text-ink/50"
            >
              <ArrowLeft className="h-4 w-4" /> wróć
            </button>
            <h2 className="font-display text-xl font-bold">
              {step.kind === "signup"
                ? step.role === "child"
                  ? "🧒 Zakładasz konto dziecka"
                  : "🧑‍🍼 Zakładasz konto rodzica"
                : "Zaloguj się"}
            </h2>
            <AuthForm
              lockMode={step.kind === "signup" ? "signup" : "signin"}
              role={step.kind === "signup" ? step.role : undefined}
            />
          </div>
        )}
      </section>
    </main>
  );
}

function RoleCard({
  emoji,
  title,
  desc,
  onClick,
}: {
  emoji: string;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="brick brick-press flex items-start gap-3 p-4 text-left hover:bg-paper"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-brand-light text-2xl">
        {emoji}
      </span>
      <span className="min-w-0">
        <span className="block font-display text-lg font-bold">{title}</span>
        <span className="mt-0.5 block text-xs font-semibold text-ink/60">
          {desc}
        </span>
      </span>
    </button>
  );
}
