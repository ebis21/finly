import { todayISO } from "@/lib/utils";
import { occurrencesInRange, sumByType } from "@/lib/recurrence";
import type { Goal, Transaction } from "@/lib/types";

export interface WalletTotals {
  balance: number; // "Mam" = zrealizowane dochody − wydatki − odłożone na cele
  pending: number; // "Oczekujące" = zaplanowane od jutra do końca roku
  savedInGoals: number;
  realizedIncome: number;
  realizedExpense: number;
}

function nextDayISO(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Wspólne wyliczenie salda portfela (pulpit i podgląd dziecka u rodzica).
// Uwzględnia transakcje cykliczne (rozwinięte na wystąpienia).
export function walletTotals(
  transactions: Transaction[],
  goals: Goal[],
  today: string = todayISO()
): WalletTotals {
  const earliest = transactions.reduce(
    (min, t) => (t.date < min ? t.date : min),
    today
  );
  const realized = occurrencesInRange(transactions, earliest, today);
  const realizedIncome = sumByType(realized, "income");
  const realizedExpense = sumByType(realized, "expense");
  const savedInGoals = goals.reduce((acc, g) => acc + g.saved, 0);

  const endOfYear = `${today.slice(0, 4)}-12-31`;
  const future = occurrencesInRange(transactions, nextDayISO(today), endOfYear);
  const pending = sumByType(future, "income") - sumByType(future, "expense");

  return {
    balance: realizedIncome - realizedExpense - savedInGoals,
    pending,
    savedInGoals,
    realizedIncome,
    realizedExpense,
  };
}
