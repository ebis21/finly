"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@/lib/auth";
import type { Role } from "@/lib/types";

export type AuthMode = "signin" | "signup";

export function AuthForm({
  initialMode = "signin",
  lockMode,
  role,
  onSuccess,
}: {
  initialMode?: AuthMode;
  lockMode?: AuthMode; // gdy ustawione: brak przełącznika, tryb wymuszony
  role?: Role; // rola przekazywana przy rejestracji (rodzic/dziecko)
  onSuccess?: () => void;
}) {
  const { configured, signIn, signUp } = useAuth();
  const [modeState, setModeState] = useState<AuthMode>(initialMode);
  const mode = lockMode ?? modeState;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    const result =
      mode === "signin"
        ? await signIn(email, password)
        : await signUp(email, password, role);
    setSubmitting(false);
    if (result.error) return setMessage(result.error);
    if (result.needsConfirmation) {
      setMessage("Konto utworzone. Sprawdź e-mail i potwierdź rejestrację.");
      return;
    }
    onSuccess?.();
  }

  if (!configured) {
    return <p className="rounded-2xl border-2 border-ink bg-amber-100 p-4 text-sm font-semibold">Logowanie jest chwilowo niedostępne. Możesz kontynuować bez konta.</p>;
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={submit}>
      {!lockMode && (
        <div className="grid grid-cols-2 rounded-xl border-2 border-ink bg-paper p-1">
          <button type="button" onClick={() => { setModeState("signin"); setMessage(null); }} className={`rounded-lg px-3 py-2 text-sm font-bold ${mode === "signin" ? "bg-emerald-400" : ""}`}>Zaloguj się</button>
          <button type="button" onClick={() => { setModeState("signup"); setMessage(null); }} className={`rounded-lg px-3 py-2 text-sm font-bold ${mode === "signup" ? "bg-emerald-400" : ""}`}>Utwórz konto</button>
        </div>
      )}
      <label className="text-sm font-bold">E-mail<input className="mt-1 w-full rounded-xl border-2 border-ink px-3 py-2 font-semibold" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
      <label className="text-sm font-bold">Hasło<input className="mt-1 w-full rounded-xl border-2 border-ink px-3 py-2 font-semibold" type="password" minLength={6} autoComplete={mode === "signin" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} /></label>
      {message && <p role="status" className="rounded-xl bg-amber-100 p-3 text-sm font-semibold">{message}</p>}
      <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? "Proszę czekać…" : mode === "signin" ? "Zaloguj się" : "Utwórz konto"}</button>
    </form>
  );
}
