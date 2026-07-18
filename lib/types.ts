export type TransactionType = "income" | "expense";

// Powtarzalność transakcji. Brak = jednorazowa.
export type Recurrence = "monthly" | "yearly";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string; // ISO: RRRR-MM-DD — data (dla cyklicznych: data startu)
  category: string;
  title: string;
  note?: string;
  recurrence?: Recurrence; // gdy ustawione: transakcja powtarza się co miesiąc/rok
  addedByUserId?: string; // gdy różne od właściciela = dodane przez rodzica
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  saved: number;
}

export interface FinlyData {
  transactions: Transaction[];
  goals: Goal[];
  assets: Asset[];
}

// Rola konta wybierana przy rejestracji: rodzic (widzi dzieci) albo dziecko.
export type Role = "parent" | "child";

// Pod przyszłe logowanie (etap kont + chmura).
export interface User {
  id: string;
  name: string;
  email: string;
  role?: Role; // brak = stare konto/gość — pokazujemy pełny interfejs
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  value: number;
  updatedAt: string; // ISO: RRRR-MM-DD
}
