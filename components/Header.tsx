"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { UserRound } from "lucide-react";
import { Modal } from "@/components/Modal";
import { useAuth } from "@/lib/auth";

type AuthMode = "signin" | "signup";

export function Header() {
  const { user, loading, configured, signIn, signUp, signOut } = useAuth();
  const [accountOpen, setAccountOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    const result = mode === "signin"
      ? await signIn(email, password)
      : await signUp(email, password);
    setSubmitting(false);
    if (result.error) {
      setMessage(result.error);
      return;
    }
    if (result.needsConfirmation) {
      setMessage("Konto utworzone. Sprawdź e-mail i potwierdź rejestrację.");
      return;
    }
    setAccountOpen(false);
  }

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setMessage(null);
  }

  return (
    <header className="flex items-center gap-2.5 px-4 py-4">
      <Image src="/logo.png" alt="Logo Finly — zielony klocek z monetą" width={40} height={40} priority className="h-10 w-10 rounded-xl border-2 border-ink object-cover shadow-brick-sm" />
      <span className="font-display text-2xl font-bold">Finly</span>
      <button type="button" aria-label="Twoje konto" onClick={() => setAccountOpen(true)} className="brick-press ml-auto flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink bg-white text-ink shadow-brick-sm hover:bg-paper">
        <UserRound className="h-5 w-5" />
      </button>

      {accountOpen && (
        <Modal title="Twoje konto" onClose={() => setAccountOpen(false)}>
          {loading ? (
            <p className="py-6 text-center font-semibold text-ink/60">Sprawdzam sesję…</p>
          ) : user ? (
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl border-2 border-ink bg-paper p-4 text-center">
                <p className="font-display text-lg font-bold">{user.name}</p>
                <p className="mt-1 text-sm font-semibold text-ink/50">{user.email}</p>
                <p className="mt-3 text-xs font-semibold text-emerald-700">Dane synchronizują się z Supabase.</p>
              </div>
              <button type="button" className="btn-primary" disabled={submitting} onClick={async () => { setSubmitting(true); await signOut(); setSubmitting(false); }}>
                {submitting ? "Wylogowuję…" : "Wyloguj się"}
              </button>
            </div>
          ) : !configured ? (
            <div className="rounded-2xl border-2 border-ink bg-paper p-4">
              <p className="font-display font-bold">Grasz lokalnie</p>
              <p className="mt-2 text-sm font-semibold text-ink/60">Finly zapisuje dane na tym urządzeniu. Aby włączyć konto i chmurę, ustaw:</p>
              <code className="mt-3 block break-all text-xs">NEXT_PUBLIC_SUPABASE_URL<br />NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
            </div>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={submit}>
              <div className="grid grid-cols-2 rounded-xl border-2 border-ink bg-paper p-1">
                <button type="button" onClick={() => changeMode("signin")} className={`rounded-lg px-3 py-2 text-sm font-bold ${mode === "signin" ? "bg-emerald-400" : ""}`}>Logowanie</button>
                <button type="button" onClick={() => changeMode("signup")} className={`rounded-lg px-3 py-2 text-sm font-bold ${mode === "signup" ? "bg-emerald-400" : ""}`}>Rejestracja</button>
              </div>
              <label className="text-sm font-bold">E-mail<input className="mt-1 w-full rounded-xl border-2 border-ink px-3 py-2 font-semibold" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
              <label className="text-sm font-bold">Hasło<input className="mt-1 w-full rounded-xl border-2 border-ink px-3 py-2 font-semibold" type="password" minLength={6} autoComplete={mode === "signin" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} /></label>
              {message && <p role="status" className="rounded-xl bg-amber-100 p-3 text-sm font-semibold">{message}</p>}
              <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? "Proszę czekać…" : mode === "signin" ? "Zaloguj się" : "Utwórz konto"}</button>
              <p className="text-center text-xs font-semibold text-ink/40">Po pierwszym logowaniu lokalny portfel zostanie skopiowany tylko wtedy, gdy konto w chmurze jest puste.</p>
            </form>
          )}
        </Modal>
      )}
    </header>
  );
}
