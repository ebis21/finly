"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Modal } from "@/components/Modal";
import { ChildDetail } from "@/components/ChildDetail";
import { useAuth } from "@/lib/auth";
import { listChildren, redeemCode, type FamilyMember } from "@/lib/family";

export default function ChildrenPage() {
  const { user, loading: authLoading } = useAuth();
  const [children, setChildren] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectOpen, setConnectOpen] = useState(false);
  const [selected, setSelected] = useState<FamilyMember | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setChildren(await listChildren());
    } catch {
      setError("Nie udało się wczytać dzieci.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authLoading) void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  async function connect() {
    setBusy(true);
    setError(null);
    try {
      await redeemCode(code);
      setCode("");
      setConnectOpen(false);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nie udało się połączyć.");
    } finally {
      setBusy(false);
    }
  }

  if (!authLoading && !user) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="font-display text-3xl font-bold">Dzieci</h1>
        <div className="brick p-8 text-center">
          <p className="text-sm font-semibold text-ink/60">
            Tryb rodzica działa po zalogowaniu. Załóż konto lub zaloguj się
            (ikona konta u góry), żeby połączyć się z dzieckiem.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-3xl font-bold">Dzieci</h1>

      {loading ? (
        <div className="brick p-8 text-center">
          <p className="text-sm font-semibold text-ink/50">Wczytuję…</p>
        </div>
      ) : children.length === 0 ? (
        <div className="brick p-8 text-center">
          <p className="text-sm font-semibold text-ink/60">
            Nie masz jeszcze połączonych dzieci. Poproś dziecko o kod (w jego
            apce: konto → „Pokaż kod dla rodzica”) i wpisz go poniżej.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {children.map((c) => (
            <li key={c.linkId}>
              <button
                type="button"
                onClick={() => setSelected(c)}
                className="brick brick-press flex w-full items-center gap-3 p-3 text-left hover:bg-paper"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-brand-light text-lg">
                  🧒
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold">{c.name}</span>
                  <span className="block truncate text-xs font-semibold text-ink/40">
                    {c.email}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => {
          setConnectOpen(true);
          setCode("");
          setError(null);
        }}
        className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink/40 py-4 font-display text-sm font-bold text-ink/50 transition-colors hover:border-ink hover:text-ink"
      >
        <Plus className="h-5 w-5" strokeWidth={2.5} />
        Połącz dziecko
      </button>

      {connectOpen && (
        <Modal title="Połącz dziecko" onClose={() => setConnectOpen(false)}>
          <div className="flex flex-col gap-4">
            <div>
              <label className="label" htmlFor="code">
                Kod od dziecka
              </label>
              <input
                id="code"
                className="input text-center font-display text-2xl tracking-[0.2em]"
                placeholder="7K2P9Q"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                autoFocus
                maxLength={8}
              />
            </div>
            {error && <p className="text-xs font-bold text-rose-500">{error}</p>}
            <button
              type="button"
              className="btn-primary"
              disabled={busy || code.trim().length < 4}
              onClick={connect}
            >
              {busy ? "Łączę…" : "Połącz"}
            </button>
          </div>
        </Modal>
      )}

      {selected && (
        <ChildDetail
          child={selected}
          onClose={() => setSelected(null)}
          onChanged={refresh}
        />
      )}
    </div>
  );
}
