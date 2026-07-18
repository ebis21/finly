"use client";

import { useEffect, useState } from "react";
import {
  createLinkCode,
  listParents,
  unlink,
  type FamilyMember,
} from "@/lib/family";

export function FamilyChildPanel() {
  const [parents, setParents] = useState<FamilyMember[]>([]);
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      setParents(await listParents());
    } catch {
      setError("Nie udało się wczytać rodziców.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function generate() {
    setBusy(true);
    setError(null);
    try {
      setCode(await createLinkCode());
    } catch {
      setError("Nie udało się wygenerować kodu.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    setBusy(true);
    setError(null);
    try {
      await unlink(id);
      await refresh();
    } catch {
      setError("Nie udało się odłączyć.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border-2 border-ink bg-paper p-4 text-left">
      <p className="font-display text-sm font-bold">Rodzice</p>
      <p className="mt-0.5 text-xs font-semibold text-ink/50">
        Pokaż kod rodzicowi — będzie mógł dorzucać kieszonkowe i widzieć Twoje
        cele.
      </p>

      {code ? (
        <div className="mt-3 rounded-xl border-2 border-ink bg-white p-3 text-center">
          <p className="font-display text-3xl font-bold tracking-[0.2em]">
            {code}
          </p>
          <p className="mt-1 text-xs font-semibold text-ink/50">
            Ważny 15 minut. Podaj go rodzicowi.
          </p>
        </div>
      ) : (
        <button
          type="button"
          className="btn-primary mt-3"
          disabled={busy}
          onClick={generate}
        >
          {busy ? "…" : "Pokaż kod dla rodzica"}
        </button>
      )}

      {!loading && parents.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2">
          {parents.map((p) => (
            <li
              key={p.linkId}
              className="flex items-center gap-2 rounded-xl border-2 border-ink bg-white p-2"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold">
                  💛 {p.name}
                </span>
                <span className="block truncate text-xs font-semibold text-ink/40">
                  {p.email}
                </span>
              </span>
              <button
                type="button"
                onClick={() => void remove(p.linkId)}
                disabled={busy}
                className="shrink-0 rounded-lg border-2 border-ink bg-white px-2 py-1 text-xs font-bold text-rose-500 disabled:opacity-40"
              >
                Odłącz
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="mt-2 text-xs font-bold text-rose-500">{error}</p>}
    </div>
  );
}
