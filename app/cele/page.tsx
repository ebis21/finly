"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Modal } from "@/components/Modal";
import { useFinly } from "@/lib/store";
import { formatPLN } from "@/lib/utils";

export default function GoalsPage() {
  const { goals, addGoal, removeGoal, depositToGoal } = useFinly();
  const [addingOpen, setAddingOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [deposit, setDeposit] = useState("");

  const selected = goals.find((g) => g.id === selectedId);
  const parsedTarget = parseFloat(target.replace(",", "."));
  const parsedDeposit = parseFloat(deposit.replace(",", "."));

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Cele</h1>

      {goals.length === 0 && (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-slate-400">
            Nie masz jeszcze żadnego celu. Wymarz coś sobie! ✨
          </p>
        </div>
      )}

      <ul className="flex flex-col gap-3">
        {goals.map((g) => {
          const percent = Math.min(100, Math.round((g.saved / g.target) * 100));
          const done = g.saved >= g.target;
          return (
            <li key={g.id}>
              <button
                type="button"
                onClick={() => {
                  setSelectedId(g.id);
                  setDeposit("");
                }}
                className="w-full rounded-2xl bg-white p-4 text-left shadow-sm transition-colors hover:bg-slate-100"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-bold">🎯 {g.name}</span>
                  <span className="text-sm font-medium text-slate-500">
                    {percent}%
                  </span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-brand transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  {done ? (
                    <span className="font-bold text-brand-dark">
                      Brawo! Cel osiągnięty 🎉
                    </span>
                  ) : (
                    <>
                      <span className="font-bold text-slate-700">
                        {formatPLN(g.saved)}
                      </span>{" "}
                      z {formatPLN(g.target)} — zostało{" "}
                      {formatPLN(g.target - g.saved)}
                    </>
                  )}
                </p>
              </button>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={() => {
          setAddingOpen(true);
          setName("");
          setTarget("");
        }}
        className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 py-4 text-sm font-bold text-slate-500 transition-colors hover:border-brand hover:text-brand-dark"
      >
        <Plus className="h-5 w-5" />
        Nowy cel
      </button>

      {addingOpen && (
        <Modal title="Nowy cel" onClose={() => setAddingOpen(false)}>
          <div className="flex flex-col gap-4">
            <div>
              <label className="label" htmlFor="goal-name">
                Na co zbierasz?
              </label>
              <input
                id="goal-name"
                className="input"
                placeholder="Np. iPad, rower, wakacje…"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="goal-target">
                Ile potrzebujesz? (zł)
              </label>
              <input
                id="goal-target"
                className="input"
                inputMode="decimal"
                placeholder="0,00"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="btn-primary"
              disabled={!(name.trim() && parsedTarget > 0)}
              onClick={() => {
                addGoal({ name: name.trim(), target: parsedTarget, saved: 0 });
                setAddingOpen(false);
              }}
            >
              Dodaj cel
            </button>
          </div>
        </Modal>
      )}

      {selected && (
        <Modal title={`🎯 ${selected.name}`} onClose={() => setSelectedId(null)}>
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl bg-slate-50 p-4 text-center">
              <p className="text-3xl font-bold tracking-tight text-brand-dark">
                {formatPLN(selected.saved)}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                z {formatPLN(selected.target)}
              </p>
            </div>
            {selected.saved >= selected.target ? (
              <p className="text-center font-bold text-brand-dark">
                Brawo! Cel osiągnięty 🎉
              </p>
            ) : (
              <div>
                <label className="label" htmlFor="goal-deposit">
                  Ile odkładasz? (zł)
                </label>
                <div className="flex gap-2">
                  <input
                    id="goal-deposit"
                    className="input"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={deposit}
                    onChange={(e) => setDeposit(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn-primary w-auto shrink-0 px-5"
                    disabled={!(parsedDeposit > 0)}
                    onClick={() => {
                      depositToGoal(selected.id, parsedDeposit);
                      setDeposit("");
                    }}
                  >
                    Wpłać
                  </button>
                </div>
              </div>
            )}
            <button
              type="button"
              className="btn-danger"
              onClick={() => {
                removeGoal(selected.id);
                setSelectedId(null);
              }}
            >
              Usuń cel
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
