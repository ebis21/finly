export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string; // ISO: RRRR-MM-DD
  category: string;
  title: string;
  note?: string;
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  saved: number;
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  value: number;
  updatedAt: string; // ISO: RRRR-MM-DD
}
