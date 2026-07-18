import type { Recurrence, Transaction, TransactionType } from "@/lib/types";

// Pojedyncze wystąpienie transakcji na konkretny dzień. Cykliczna transakcja
// (np. wypłata co miesiąc) rozwija się na wiele wystąpień w danym zakresie dat.
export interface Occurrence {
  sourceId: string;
  type: TransactionType;
  amount: number;
  date: string; // ISO: RRRR-MM-DD — dzień tego wystąpienia
  category: string;
  title: string;
  note?: string;
  recurrence?: Recurrence;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

// Dodaje jeden okres (miesiąc/rok) do daty ISO, przycinając dzień do długości
// docelowego miesiąca (np. 31 sty + miesiąc => 28/29 lut).
export function addPeriod(iso: string, recurrence: Recurrence): string {
  const [y, m, d] = iso.split("-").map(Number);
  let year = y;
  let month = m;
  if (recurrence === "monthly") {
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  } else {
    year += 1;
  }
  const daysInMonth = new Date(year, month, 0).getDate();
  return `${year}-${pad(month)}-${pad(Math.min(d, daysInMonth))}`;
}

function toOccurrence(t: Transaction, date: string): Occurrence {
  return {
    sourceId: t.id,
    type: t.type,
    amount: t.amount,
    date,
    category: t.category,
    title: t.title,
    note: t.note,
    recurrence: t.recurrence,
  };
}

// Zwraca wszystkie wystąpienia (jednorazowe i cykliczne) w zakresie [from, to]
// włącznie. Zakres i daty porównywane leksykograficznie jako ISO (RRRR-MM-DD).
export function occurrencesInRange(
  transactions: Transaction[],
  from: string,
  to: string
): Occurrence[] {
  const out: Occurrence[] = [];
  if (from > to) return out;

  for (const t of transactions) {
    if (!t.recurrence) {
      if (t.date >= from && t.date <= to) out.push(toOccurrence(t, t.date));
      continue;
    }
    // Cykliczna: iteruj od daty startu, dopóki nie przekroczysz `to`.
    let date = t.date;
    let guard = 0;
    while (date <= to && guard < 5000) {
      if (date >= from) out.push(toOccurrence(t, date));
      date = addPeriod(date, t.recurrence);
      guard += 1;
    }
  }
  return out;
}

export function sumByType(occurrences: Occurrence[], type: TransactionType): number {
  return occurrences
    .filter((o) => o.type === type)
    .reduce((acc, o) => acc + o.amount, 0);
}
