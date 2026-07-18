import { todayISO } from "@/lib/utils";
import type { Goal, Transaction } from "@/lib/types";

export interface WalletTotals {
  balance: number; // "Mam" = zrealizowane dochody − wydatki − odłożone na cele
  pending: number; // "Oczekujące" = dochody z datą w przyszłości
  savedInGoals: number;
  realizedIncome: number;
  realizedExpense: number;
}

// Wspólne wyliczenie salda portfela (pulpit i podgląd dziecka u rodzica).
export function walletTotals(
  transactions: Transaction[],
  goals: Goal[],
  today: string = todayISO()
): WalletTotals {
  let realizedIncome = 0;
  let realizedExpense = 0;
  let pending = 0;
  for (const t of transactions) {
    if (t.type === "income") {
      if (t.date > today) pending += t.amount;
      else realizedIncome += t.amount;
    } else if (t.date <= today) {
      realizedExpense += t.amount;
    }
  }
  const savedInGoals = goals.reduce((acc, g) => acc + g.saved, 0);
  return {
    balance: realizedIncome - realizedExpense - savedInGoals,
    pending,
    savedInGoals,
    realizedIncome,
    realizedExpense,
  };
}
