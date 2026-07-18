"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/components/Modal";
import { useFinly } from "@/lib/store";
import { cn, todayISO } from "@/lib/utils";
import type { TransactionType } from "@/lib/types";

const CUSTOM = "__custom__";

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

export function AddTransactionSheet() {
  const { addOpen, setAddOpen, addTransaction, transactions } = useFinly();
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [date, setDate] = useState(todayISO);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Kategorie: wbudowane + własne wcześniej użyte (pamiętane przez transakcje).
  const categoryOptions = useMemo(() => {
    const used = transactions
      .filter((t) => t.type === type)
      .map((t) => t.category);
    return [...new Set([...CATEGORIES[type], ...used])];
  }, [transactions, type]);

  if (!addOpen) return null;

  const parsedAmount = parseFloat(amount.replace(",", "."));
  const creatingCustom = category === CUSTOM;
  const resolvedCategory = creatingCustom
    ? customCategory.trim()
    : category || "Inne";
  const valid =
    parsedAmount > 0 &&
    title.trim().length > 0 &&
    (!creatingCustom || customCategory.trim().length > 0);
  const isFutureIncome = type === "income" && date > todayISO();

  function switchType(next: TransactionType) {
    setType(next);
    setCategory("");
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
    });
    setSubmitting(false);
    if (result.error) return;
    setAmount("");
    setTitle("");
    setCategory("");
    setCustomCategory("");
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
          <label className="label" htmlFor="category">
            Kategoria
          </label>
          <select
            id="category"
            className="input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Wybierz…</option>
            {categoryOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            <option value={CUSTOM}>➕ Stwórz własną…</option>
          </select>
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
          <label className="label" htmlFor="date">
            Data
          </label>
          <input
            id="date"
            type="date"
            className="input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          {isFutureIncome && (
            <p className="mt-1.5 text-xs font-semibold text-brand-dark">
              Data w przyszłości — ten dochód trafi do „Oczekujące” i wejdzie do
              salda, gdy nadejdzie ten dzień.
            </p>
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
