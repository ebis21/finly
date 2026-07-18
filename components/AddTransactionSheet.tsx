"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/components/Modal";
import { useFinly } from "@/lib/store";
import { cn, todayISO } from "@/lib/utils";
import type { Recurrence, TransactionType } from "@/lib/types";

const CATEGORIES: Record<TransactionType, string[]> = {
  income: ["Wypłata", "Premia", "Zlecenie", "Sprzedaż", "Kieszonkowe", "Inne"],
  expense: [
    "Jedzenie",
    "Zakupy",
    "Zdrowie",
    "Prezenty",
    "Rozrywka",
    "Transport",
    "Rachunki",
    "Inne",
  ],
};

const CATEGORY_EMOJI: Record<string, string> = {
  Wypłata: "💼",
  Premia: "🏆",
  Zlecenie: "🛠️",
  Sprzedaż: "🛍️",
  Kieszonkowe: "🐷",
  Jedzenie: "🍎",
  Zakupy: "🛒",
  Zdrowie: "🩺",
  Prezenty: "🎁",
  Rozrywka: "🎮",
  Transport: "🚌",
  Rachunki: "📄",
};

const RECURRENCE_OPTIONS: { value: Recurrence | "none"; label: string }[] = [
  { value: "none", label: "Jednorazowo" },
  { value: "monthly", label: "Co miesiąc" },
  { value: "yearly", label: "Co rok" },
];

export function AddTransactionSheet() {
  const { addOpen, setAddOpen, addTransaction, transactions } = useFinly();
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [creatingCustom, setCreatingCustom] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [recurrence, setRecurrence] = useState<Recurrence | "none">("none");
  const [date, setDate] = useState(todayISO);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Do wyboru: wbudowane kategorie + własne, których już użyto (są pamiętane).
  const categoryOptions = useMemo(() => {
    const used = transactions
      .filter((t) => t.type === type)
      .map((t) => t.category);
    return [...new Set([...CATEGORIES[type], ...used])];
  }, [transactions, type]);

  if (!addOpen) return null;

  const parsedAmount = parseFloat(amount.replace(",", "."));
  const resolvedCategory = creatingCustom
    ? customCategory.trim()
    : category || "Inne";
  const valid =
    parsedAmount > 0 &&
    title.trim().length > 0 &&
    (!creatingCustom || customCategory.trim().length > 0);
  const isFuture = date > todayISO();

  const chipActive =
    type === "income"
      ? "border-ink bg-brand text-white shadow-brick-sm"
      : "border-ink bg-rose-400 text-white shadow-brick-sm";
  const chipIdle = "border-ink/20 bg-white text-ink/50";

  function switchType(next: TransactionType) {
    setType(next);
    setCategory("");
    setCreatingCustom(false);
    setCustomCategory("");
  }

  async function submit() {
    if (!valid || submitting) return;
    setSubmitting(true);
    const result = await addTransaction({
      type,
      amount: parsedAmount,
      title: title.trim(),
      category: resolvedCategory || "Inne",
      date,
      note: note.trim() || undefined,
      recurrence: recurrence === "none" ? undefined : recurrence,
    });
    setSubmitting(false);
    if (result.error) return;
    setAmount("");
    setTitle("");
    setCategory("");
    setCreatingCustom(false);
    setCustomCategory("");
    setRecurrence("none");
    setNote("");
    setDate(todayISO());
    setAddOpen(false);
  }

  return (
    <Modal title="Dodaj transakcję" onClose={() => setAddOpen(false)}>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => switchType("income")}
            className={cn(
              "rounded-2xl border-2 py-2.5 font-display text-sm font-bold transition-all",
              type === "income"
                ? "border-ink bg-brand text-white shadow-brick-sm"
                : "border-ink/20 bg-white text-ink/40"
            )}
          >
            Dochód
          </button>
          <button
            type="button"
            onClick={() => switchType("expense")}
            className={cn(
              "rounded-2xl border-2 py-2.5 font-display text-sm font-bold transition-all",
              type === "expense"
                ? "border-ink bg-rose-400 text-white shadow-brick-sm"
                : "border-ink/20 bg-white text-ink/40"
            )}
          >
            Wydatek
          </button>
        </div>

        <div>
          <label className="label" htmlFor="amount">
            Kwota (zł)
          </label>
          <input
            id="amount"
            className="input"
            inputMode="decimal"
            placeholder="0,00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div>
          <label className="label" htmlFor="title">
            Tytuł
          </label>
          <input
            id="title"
            className="input"
            placeholder={
              type === "income" ? "Np. sprzedaż lemoniady" : "Np. prezent dla mamy"
            }
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="label">Kategoria</label>
          <div className="flex flex-wrap gap-2">
            {categoryOptions.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setCategory(c);
                  setCreatingCustom(false);
                }}
                className={cn(
                  "rounded-full border-2 px-3 py-1.5 text-sm font-bold transition-all",
                  !creatingCustom && category === c ? chipActive : chipIdle
                )}
              >
                {CATEGORY_EMOJI[c] ? `${CATEGORY_EMOJI[c]} ` : ""}
                {c}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setCreatingCustom(true);
                setCategory("");
              }}
              className={cn(
                "rounded-full border-2 px-3 py-1.5 text-sm font-bold transition-all",
                creatingCustom ? chipActive : chipIdle
              )}
            >
              ➕ Własna
            </button>
          </div>
          {creatingCustom && (
            <input
              className="input mt-2"
              placeholder="Nazwa własnej kategorii, np. Zwierzak"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              autoFocus
            />
          )}
        </div>

        <div>
          <label className="label">Powtarzalność</label>
          <div className="grid grid-cols-3 gap-2">
            {RECURRENCE_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => setRecurrence(o.value)}
                className={cn(
                  "rounded-2xl border-2 py-2.5 font-display text-sm font-bold transition-all",
                  recurrence === o.value
                    ? "border-ink bg-ink text-white shadow-brick-sm"
                    : "border-ink/20 bg-white text-ink/40"
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label" htmlFor="date">
            {recurrence === "none" ? "Data" : "Data startu"}
          </label>
          <input
            id="date"
            type="date"
            className="input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          {recurrence !== "none" ? (
            <p className="mt-1.5 text-xs font-semibold text-ink/50">
              {type === "income" ? "Ten dochód" : "Ten wydatek"} będzie liczony{" "}
              {recurrence === "monthly" ? "co miesiąc" : "co rok"} od tej daty.
            </p>
          ) : (
            isFuture &&
            type === "income" && (
              <p className="mt-1.5 text-xs font-semibold text-brand-dark">
                Data w przyszłości — ten dochód trafi do „Oczekujące” i wejdzie do
                salda, gdy nadejdzie ten dzień.
              </p>
            )
          )}
        </div>

        <div>
          <label className="label" htmlFor="note">
            Notatka (opcjonalnie)
          </label>
          <textarea
            id="note"
            className="input"
            rows={2}
            placeholder="Dla kogo, na co, po co…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <button type="button" className="btn-primary" disabled={!valid || submitting} onClick={submit}>
          {submitting ? "Zapisuję…" : "Dodaj"}
        </button>
      </div>
    </Modal>
  );
}
