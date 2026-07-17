"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";
import { useFinly } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { TransactionType } from "@/lib/types";

const CATEGORIES: Record<TransactionType, string[]> = {
  income: ["Wypłata", "Premia", "Zlecenie", "Sprzedaż", "Kieszonkowe", "Inne"],
  expense: [
    "Jedzenie",
    "Zakupy",
    "Prezenty",
    "Rozrywka",
    "Transport",
    "Rachunki",
    "Inne",
  ],
};

export function AddTransactionSheet() {
  const { addOpen, setAddOpen, addTransaction } = useFinly();
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!addOpen) return null;

  const parsedAmount = parseFloat(amount.replace(",", "."));
  const valid = parsedAmount > 0 && title.trim().length > 0;

  function switchType(next: TransactionType) {
    setType(next);
    setCategory("");
  }

  async function submit() {
    if (!valid || submitting) return;
    setSubmitting(true);
    const result = await addTransaction({
      type,
      amount: parsedAmount,
      title: title.trim(),
      category: category || "Inne",
      date,
      note: note.trim() || undefined,
    });
    setSubmitting(false);
    if (result.error) return;
    setAmount("");
    setTitle("");
    setCategory("");
    setNote("");
    setDate(new Date().toISOString().slice(0, 10));
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
            {CATEGORIES[type].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
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
