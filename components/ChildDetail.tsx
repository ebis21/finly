"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/Modal";
import {
  addPocketMoney,
  contributeToChildGoal,
  loadChildPortfolio,
  unlink,
  type ChildPortfolio,
  type FamilyMember,
} from "@/lib/family";
import { formatPLN } from "@/lib/utils";

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

  const [pocket, setPocket] = useState("");
  const [goalId, setGoalId] = useState("");
  const [goalAmount, setGoalAmount] = useState("");

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

  const parsedPocket = parseFloat(pocket.replace(",", "."));
  const parsedGoal = parseFloat(goalAmount.replace(",", "."));

  async function give() {
    if (!(parsedPocket > 0)) return;
    setBusy(true);
    setError(null);
    try {
      await addPocketMoney(child.userId, parsedPocket, "Kieszonkowe");
      setPocket("");
      await refresh();
      await onChanged();
    } catch {
      setError("Nie udało się dodać kieszonkowego.");
    } finally {
      setBusy(false);
    }
  }

  async function boost() {
    if (!(parsedGoal > 0) || !goalId) return;
    setBusy(true);
    setError(null);
    try {
      await contributeToChildGoal(goalId, parsedGoal);
      setGoalAmount("");
      setGoalId("");
      await refresh();
    } catch {
      setError("Nie udało się dopłacić do celu.");
    } finally {
      setBusy(false);
    }
  }

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
              <p className="font-display text-4xl font-bold tracking-tight">
                {formatPLN(data.totals.balance)}
              </p>
              <p className="mt-1 text-xs font-bold text-emerald-100/80">
                Oczekujące {formatPLN(data.totals.pending)}
              </p>
            </div>

            <div>
              <label className="label" htmlFor="pocket">
                Dorzuć kieszonkowe (zł)
              </label>
              <div className="flex gap-2">
                <input
                  id="pocket"
                  className="input"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={pocket}
                  onChange={(e) => setPocket(e.target.value)}
                />
                <button
                  type="button"
                  className="btn-primary w-auto shrink-0 px-5"
                  disabled={busy || !(parsedPocket > 0)}
                  onClick={give}
                >
                  {busy ? "…" : "Dorzuć"}
                </button>
              </div>
            </div>

            <div>
              <p className="label">Cele dziecka</p>
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
              {data.goals.length > 0 && (
                <div className="mt-2 flex gap-2">
                  <select
                    className="input"
                    value={goalId}
                    onChange={(e) => setGoalId(e.target.value)}
                    aria-label="Wybierz cel do dopłaty"
                  >
                    <option value="">Wybierz cel…</option>
                    {data.goals.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                  <input
                    className="input w-24 shrink-0"
                    inputMode="decimal"
                    placeholder="zł"
                    value={goalAmount}
                    onChange={(e) => setGoalAmount(e.target.value)}
                    aria-label="Kwota dopłaty do celu"
                  />
                  <button
                    type="button"
                    className="btn-primary w-auto shrink-0 px-4"
                    disabled={busy || !goalId || !(parsedGoal > 0)}
                    onClick={boost}
                  >
                    Dopłać
                  </button>
                </div>
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
