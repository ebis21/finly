"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Modal } from "@/components/Modal";
import { useFinly } from "@/lib/store";
import { cn, formatDate, formatPLN, type Period } from "@/lib/utils";
import { occurrencesInRange } from "@/lib/recurrence";
import type { TransactionType } from "@/lib/types";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

// Zakres dat dla wybranego okresu (Miesiąc / Rok / Wszystko).
function periodRange(period: Period) {
  const now = new Date();
  const y = now.getFullYear();
  if (period === "year") return { from: `${y}-01-01`, to: `${y}-12-31` };
  if (period === "month") {
    const m = now.getMonth();
    const last = new Date(y, m + 1, 0).getDate();
    return { from: `${y}-${pad(m + 1)}-01`, to: `${y}-${pad(m + 1)}-${pad(last)}` };
  }
  return { from: "0000-01-01", to: `${y}-12-31` }; // all
}

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
  Zdrowie: "🩺",
};

const COPY: Record<
  TransactionType,
  { title: string; empty: string; shareLabel: string }
> = {
  expense: {
    title: "Na co wydaję",
    empty: "Brak wydatków. Dodaj pierwszy przyciskiem",
    shareLabel: "wszystkich wydatków",
  },
  income: {
    title: "Skąd mam pieniądze",
    empty: "Brak dochodów. Dodaj pierwszy przyciskiem",
    shareLabel: "wszystkich dochodów",
  },
};

function pluralPozycje(n: number) {
  if (n === 1) return "pozycja";
  const d = n % 10;
  const h = n % 100;
  if (d >= 2 && d <= 4 && !(h >= 12 && h <= 14)) return "pozycje";
  return "pozycji";
}

export function CategoryDashboard({
  type,
  period,
}: {
  type: TransactionType;
  period: Period;
}) {
  const { transactions, removeTransaction } = useFinly();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const income = type === "income";
  const copy = COPY[type];
  const range = periodRange(period);
  // Wystąpienia (w tym cykliczne rozwinięte na dni) danego typu w okresie.
  const items = occurrencesInRange(transactions, range.from, range.to).filter(
    (o) => o.type === type
  );
  const total = items.reduce((acc, o) => acc + o.amount, 0);

  const byCategory = new Map<string, number>();
  for (const o of items) {
    byCategory.set(o.category, (byCategory.get(o.category) ?? 0) + o.amount);
  }
  const categories = [...byCategory.entries()].sort((a, b) => b[1] - a[1]);
  const max = categories.length > 0 ? categories[0][1] : 0;

  const selectedTransactions = items
    .filter((o) => o.category === selectedCategory)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (items.length === 0) {
    return (
      <section>
        <h2 className="mb-2 font-display text-xl font-bold">{copy.title}</h2>
        <div className="brick p-8 text-center">
          <p className="text-sm font-semibold text-ink/50">
            {copy.empty} <span className="font-bold text-brand-dark">+</span>
          </p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="font-display text-xl font-bold">{copy.title}</h2>
        <span className="font-display text-sm font-bold text-ink/50">
          razem {formatPLN(total)}
        </span>
      </div>

      <ul className="flex flex-col gap-2.5">
        {categories.map(([category, amount]) => {
          const share = Math.round((amount / total) * 100);
          return (
            <li key={category}>
              <button
                type="button"
                onClick={() => setSelectedCategory(category)}
                className="brick brick-press flex w-full items-center gap-3 p-3 text-left hover:bg-paper"
              >
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-ink text-lg",
                    income ? "bg-brand-light" : "bg-rose-100"
                  )}
                >
                  {CATEGORY_EMOJI[category] ?? (income ? "💰" : "🧾")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="truncate font-bold">{category}</span>
                    <span className="shrink-0 font-display text-sm font-bold">
                      {formatPLN(amount)}
                    </span>
                  </span>
                  <span className="mt-1.5 block h-3 overflow-hidden rounded-full border-2 border-ink bg-white">
                    <span
                      className={cn(
                        "block h-full",
                        income ? "bg-brand" : "bg-rose-400"
                      )}
                      style={{ width: `${Math.max(8, (amount / max) * 100)}%` }}
                    />
                  </span>
                  <span className="mt-1 block text-xs font-semibold text-ink/40">
                    {share}% {copy.shareLabel}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {selectedCategory && selectedTransactions.length > 0 && (
        <Modal
          title={`${CATEGORY_EMOJI[selectedCategory] ?? (income ? "💰" : "🧾")} ${selectedCategory}`}
          onClose={() => setSelectedCategory(null)}
        >
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border-2 border-ink bg-paper p-4 text-center">
              <p
                className={cn(
                  "font-display text-3xl font-bold tracking-tight",
                  income ? "text-brand-dark" : "text-rose-500"
                )}
              >
                {formatPLN(
                  selectedTransactions.reduce((acc, t) => acc + t.amount, 0)
                )}
              </p>
              <p className="mt-1 text-sm font-semibold text-ink/40">
                {selectedTransactions.length}{" "}
                {pluralPozycje(selectedTransactions.length)}
              </p>
            </div>
            <ul className="flex flex-col divide-y-2 divide-paper">
              {selectedTransactions.map((o) => (
                <li key={`${o.sourceId}-${o.date}`} className="flex items-center gap-3 py-2.5">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold">
                      {o.title}
                      {o.recurrence ? (
                        <span className="ml-1.5 rounded-full border border-ink/20 px-1.5 py-px text-[10px] font-bold text-ink/50">
                          ↻ {o.recurrence === "monthly" ? "co mies." : "co rok"}
                        </span>
                      ) : null}
                      {o.addedByUserId ? (
                        <span className="ml-1.5 rounded-full border border-ink/20 px-1.5 py-px text-[10px] font-bold text-ink/50">
                          💛 od rodzica
                        </span>
                      ) : null}
                    </span>
                    <span className="block text-xs font-semibold text-ink/40">
                      {formatDate(o.date)}
                      {o.note ? ` · ${o.note}` : ""}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "shrink-0 font-display text-sm font-bold",
                      income ? "text-brand-dark" : "text-rose-500"
                    )}
                  >
                    {income ? "+" : "-"}
                    {formatPLN(o.amount)}
                  </span>
                  <button
                    type="button"
                    aria-label={
                      o.recurrence
                        ? `Usuń powtarzającą się pozycję ${o.title} (usuwa całą serię)`
                        : `Usuń pozycję ${o.title}`
                    }
                    onClick={() => void removeTransaction(o.sourceId)}
                    className="brick-press shrink-0 rounded-xl border-2 border-ink bg-white p-1.5 text-rose-500 shadow-brick-sm hover:bg-rose-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </Modal>
      )}
    </section>
  );
}
