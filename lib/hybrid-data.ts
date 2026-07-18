import type { Asset, FinlyData, Goal, Transaction, TransactionType } from "@/lib/types";

export interface TransactionRow {
  id: string;
  type: TransactionType;
  amount: number | string;
  date: string;
  category: string | null;
  description: string | null;
  note: string | null;
  added_by_user_id?: string | null;
}

export interface GoalRow {
  id: string;
  name: string;
  target_amount: number | string;
  saved_amount: number | string;
}

export interface AssetRow {
  id: string;
  name: string;
  type: string | null;
  value: number | string;
  updated_at: string;
}

export function shouldImportLocalData(cloud: FinlyData, local: FinlyData) {
  const cloudIsEmpty =
    cloud.transactions.length === 0 &&
    cloud.goals.length === 0 &&
    cloud.assets.length === 0;
  const localHasData =
    local.transactions.length > 0 ||
    local.goals.length > 0 ||
    local.assets.length > 0;
  return cloudIsEmpty && localHasData;
}

export function rowToTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    type: row.type,
    amount: Number(row.amount),
    date: row.date,
    category: row.category ?? "Inne",
    title: row.description ?? "",
    note: row.note ?? undefined,
    addedByUserId: row.added_by_user_id ?? undefined,
  };
}

export function rowToGoal(row: GoalRow): Goal {
  return {
    id: row.id,
    name: row.name,
    target: Number(row.target_amount),
    saved: Number(row.saved_amount),
  };
}

export function rowToAsset(row: AssetRow): Asset {
  return {
    id: row.id,
    name: row.name,
    type: row.type ?? "Inne",
    value: Number(row.value),
    updatedAt: row.updated_at.slice(0, 10),
  };
}

export function toTransactionInsert(transaction: Omit<Transaction, "id"> | Transaction, userId: string) {
  return {
    user_id: userId,
    type: transaction.type,
    amount: transaction.amount,
    date: transaction.date,
    category: transaction.category,
    description: transaction.title,
    note: transaction.note ?? null,
  };
}

export function toGoalInsert(goal: Omit<Goal, "id"> | Goal, userId: string) {
  return {
    user_id: userId,
    name: goal.name,
    target_amount: goal.target,
    saved_amount: goal.saved,
  };
}

export function toAssetInsert(asset: Omit<Asset, "id" | "updatedAt"> | Asset, userId: string) {
  return {
    user_id: userId,
    name: asset.name,
    type: asset.type,
    value: asset.value,
    updated_at: "updatedAt" in asset ? asset.updatedAt : new Date().toISOString(),
  };
}
