"use client";

import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Eye } from "lucide-react";
import { Modal } from "@/components/Modal";
import {
  loadChildPortfolio,
  unlink,
  type ChildPortfolio,
  type FamilyMember,
} from "@/lib/family";
import { formatDate, formatPLN } from "@/lib/utils";

export function ChildDetail({
  child,
  onClose,
  onChanged,
}: {
  child: FamilyMember;
  onClose: () => void;
  onChanged: () => void | Promise<void>;
}) {
  const [data, setData] = useState<ChildPortfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      setData(await loadChildPortfolio(child.userId));
      setError(null);
    } catch {
      setError("Nie udało się wczytać portfela dziecka.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [child.userId]);

  async function disconnect() {
    setBusy(true);
    setError(null);
    try {
      await unlink(child.linkId);
      await onChanged();
      onClose();
    } catch {
      setError("Nie udało się odłączyć.");
      setBusy(false);
    }
  }

  return (
    <Modal title={`🧒 ${child.name}`} onClose={onClose}>
      <div className="flex flex-col gap-4">
        {loading ? (
          <p className="py-6 text-center font-semibold text-ink/60">Wczytuję…</p>
        ) : data ? (
          <>
            <div className="rounded-2xl border-2 border-ink bg-gradient-to-b from-brand to-brand-dark p-4 text-center text-white">
              <p className="text-xs font-bold text-emerald-100">Ma</p>
              <p className="font-display text-4xl font-bold tracking-tight [overflow-wrap:anywhere]">
                {formatPLN(data.totals.balance)}
              </p>
              <p className="mt-1 text-xs font-bold text-emerald-100/80">
                Oczekujące {formatPLN(data.totals.pending)}
              </p>
            </div>

            <p className="inline-flex items-center justify-center gap-1.5 rounded-xl border-2 border-ink bg-paper px-3 py-2 text-xs font-bold text-ink/60">
              <Eye className="h-4 w-4" /> Podgląd tylko do odczytu — nie zmieniasz
              konta dziecka.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-2xl border-2 border-ink bg-white p-3">
                <p className="text-xs font-bold text-ink/50">Wpłynęło</p>
                <p className="font-display text-lg font-bold text-brand-dark [overflow-wrap:anywhere]">
                  {formatPLN(data.totals.realizedIncome)}
                </p>
              </div>
              <div className="rounded-2xl border-2 border-ink bg-white p-3">
                <p className="text-xs font-bold text-ink/50">Wydane</p>
                <p className="font-display text-lg font-bold text-rose-500 [overflow-wrap:anywhere]">
                  {formatPLN(data.totals.realizedExpense)}
                </p>
              </div>
            </div>

            <div>
              <p className="label">Ostatnie operacje</p>
              {data.transactions.length === 0 ? (
                <p className="text-xs font-semibold text-ink/40">
                  Brak dochodów i wydatków.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {data.transactions.slice(0, 30).map((t) => {
                    const income = t.type === "income";
                    return (
                      <li
                        key={t.id}
                        className="flex items-center gap-2.5 rounded-xl border-2 border-ink bg-white p-2.5"
                      >
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 border-ink ${
                            income ? "bg-brand-light" : "bg-rose-100"
                          }`}
                        >
                          {income ? (
                            <ArrowUpRight className="h-4 w-4 text-brand-dark" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-rose-500" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold">
                            {t.title || t.category}
                          </span>
                          <span className="block truncate text-xs font-semibold text-ink/40">
                            {t.category} · {formatDate(t.date)}
                            {t.recurrence ? " · cykliczne" : ""}
                          </span>
                        </span>
                        <span
                          className={`shrink-0 font-display text-sm font-bold ${
                            income ? "text-brand-dark" : "text-rose-500"
                          }`}
                        >
                          {income ? "+" : "−"}
                          {formatPLN(t.amount)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div>
              <p className="label">Aktywa</p>
              {data.assets.length === 0 ? (
                <p className="text-xs font-semibold text-ink/40">
                  Dziecko nie ma jeszcze aktywów.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {data.assets.map((a) => (
                    <li
                      key={a.id}
                      className="flex items-center gap-2 rounded-xl border-2 border-ink bg-white p-2.5"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold">
                          {a.name}
                        </span>
                        <span className="block truncate text-xs font-semibold text-ink/40">
                          {a.type}
                        </span>
                      </span>
                      <span className="shrink-0 font-display text-sm font-bold">
                        {formatPLN(a.value)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <p className="label">Cele</p>
              {data.goals.length === 0 ? (
                <p className="text-xs font-semibold text-ink/40">
                  Dziecko nie ma jeszcze celów.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {data.goals.map((g) => {
                    const pct = Math.min(
                      100,
                      Math.round((g.saved / g.target) * 100)
                    );
                    return (
                      <li
                        key={g.id}
                        className="rounded-xl border-2 border-ink bg-white p-2.5"
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="truncate font-bold">🎯 {g.name}</span>
                          <span className="shrink-0 font-display text-xs font-bold text-ink/60">
                            {pct}%
                          </span>
                        </div>
                        <div className="mt-1.5 h-3 overflow-hidden rounded-full border-2 border-ink bg-white">
                          <div
                            className={
                              g.saved >= g.target
                                ? "h-full bg-brand"
                                : "h-full bg-sun"
                            }
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="mt-1 text-xs font-semibold text-ink/50">
                          {formatPLN(g.saved)} z {formatPLN(g.target)}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {error && <p className="text-xs font-bold text-rose-500">{error}</p>}

            <button
              type="button"
              className="btn-danger"
              disabled={busy}
              onClick={disconnect}
            >
              Odłącz dziecko
            </button>
          </>
        ) : (
          <p className="py-6 text-center font-semibold text-rose-500">
            {error ?? "Coś poszło nie tak."}
          </p>
        )}
      </div>
    </Modal>
  );
}
