import { todayISO } from "@/lib/utils";
import { occurrencesInRange, sumByType } from "@/lib/recurrence";
import type { Goal, Transaction } from "@/lib/types";

// Ostatni dzień miesiąca, w którym mieści się dana data ISO (RRRR-MM-DD).
function endOfMonthISO(iso: string): string {
  const [y, m] = iso.split("-").map(Number);
  const last = new Date(y, m, 0).getDate();
  return `${iso.slice(0, 7)}-${String(last).padStart(2, "0")}`;
}

export interface WalletTotals {
  balance: number; // "Mam" = zrealizowane dochody − wydatki − odłożone na cele
  pending: number; // "Oczekujące" = zaplanowane od jutra do końca bieżącego miesiąca
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

  // "Oczekujące" liczymy tylko do końca bieżącego miesiąca. Dla dochodu
  // cyklicznego co miesiąc bierzemy więc najwyżej jedno wystąpienie z tego
  // miesiąca — kolejne miesiące (sierpień, wrzesień…) już się nie liczą.
  const horizon = endOfMonthISO(today);
  const future = occurrencesInRange(transactions, nextDayISO(today), horizon);
  const pending = sumByType(future, "income") - sumByType(future, "expense");

  return {
    balance: realizedIncome - realizedExpense - savedInGoals,
    pending,
    savedInGoals,
    realizedIncome,
    realizedExpense,
  };
}
