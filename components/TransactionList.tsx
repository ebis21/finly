"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";
import { useFinly } from "@/lib/store";
import { cn, formatDate, formatPLN } from "@/lib/utils";
import type { Transaction } from "@/lib/types";

const CATEGORY_EMOJI: Record<string, string> = {
  Wypłata: "💼",
  Premia: "🏆",
  Zlecenie: "🛠️",
  Sprzedaż: "🛍️",
  Kieszonkowe: "🐷",
  Jedzenie: "🍎",
  Zakupy: "🛒",
  Prezenty: "🎁",
  Rozrywka: "🎮",
  Transport: "🚌",
  Rachunki: "📄",
};

export function TransactionList() {
  const { transactions, removeTransaction } = useFinly();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));
  const selected = transactions.find((t) => t.id === selectedId);

  if (sorted.length === 0) {
    return (
      <div className="brick p-8 text-center">
        <p className="text-sm font-semibold text-ink/50">
          Brak transakcji. Dodaj pierwszą przyciskiem{" "}
          <span className="font-bold text-brand-dark">+</span>
        </p>
      </div>
    );
  }

  return (
    <>
      <ul className="flex flex-col gap-2.5">
        {sorted.map((t) => (
          <li key={t.id}>
            <button
              type="button"
              onClick={() => setSelectedId(t.id)}
              className="brick brick-press flex w-full items-center gap-3 p-3 text-left hover:bg-paper"
            >
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-ink text-lg",
                  t.type === "income" ? "bg-brand-light" : "bg-rose-100"
                )}
              >
                {CATEGORY_EMOJI[t.category] ?? "💰"}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-bold">{t.title}</span>
                <span className="block text-xs font-semibold text-ink/40">
                  {t.category} · {formatDate(t.date)}
                </span>
              </span>
              <Amount transaction={t} className="font-display text-sm font-bold" />
            </button>
          </li>
        ))}
      </ul>

      {selected && (
        <Modal title={selected.title} onClose={() => setSelectedId(null)}>
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border-2 border-ink bg-paper p-4 text-center">
              <Amount
                transaction={selected}
                className="font-display text-3xl font-bold tracking-tight"
              />
            </div>
            <dl className="flex flex-col divide-y-2 divide-paper">
              <DetailRow
                label="Typ"
                value={selected.type === "income" ? "Dochód" : "Wydatek"}
              />
              <DetailRow label="Data" value={formatDate(selected.date)} />
              <DetailRow
                label="Kategoria"
                value={`${CATEGORY_EMOJI[selected.category] ?? "💰"} ${selected.category}`}
              />
              {selected.note && <DetailRow label="Notatka" value={selected.note} />}
            </dl>
            <button
              type="button"
              className="btn-danger"
              onClick={() => {
                removeTransaction(selected.id);
                setSelectedId(null);
              }}
            >
              Usuń transakcję
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

function Amount({
  transaction,
  className,
}: {
  transaction: Transaction;
  className?: string;
}) {
  const income = transaction.type === "income";
  return (
    <span
      className={cn(income ? "text-brand-dark" : "text-rose-500", className)}
    >
      {income ? "+" : "-"}
      {formatPLN(transaction.amount)}
    </span>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="shrink-0 text-sm font-bold text-ink/40">{label}</dt>
      <dd className="text-right text-sm font-bold">{value}</dd>
    </div>
  );
}
