import type { SupabaseClient } from "@supabase/supabase-js";
import {
  rowToAsset,
  rowToGoal,
  rowToTransaction,
  toAssetInsert,
  toGoalInsert,
  toTransactionInsert,
  type AssetRow,
  type GoalRow,
  type TransactionRow,
} from "@/lib/hybrid-data";
import type { Asset, FinlyData, Goal, Transaction } from "@/lib/types";

function assertNoError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

// Wczytuje WYŁĄCZNIE dane właściciela konta. Filtr po user_id jest konieczny:
// rodzic połączony z dzieckiem ma (przez RLS) prawo odczytu wierszy dziecka,
// więc bez tego filtra `select("*")` wciągnąłby dane dziecka na pulpit rodzica.
// Podgląd dziecka u rodzica jest osobny (lib/family.ts, filtr po id dziecka).
export async function loadCloudData(client: SupabaseClient, userId: string): Promise<FinlyData> {
  const [transactions, goals, assets] = await Promise.all([
    client.from("transactions").select("*").eq("user_id", userId).order("date", { ascending: false }),
    client.from("goals").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
    client.from("assets").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
  ]);
  assertNoError(transactions.error);
  assertNoError(goals.error);
  assertNoError(assets.error);
  return {
    transactions: ((transactions.data ?? []) as TransactionRow[]).map(rowToTransaction),
    goals: ((goals.data ?? []) as GoalRow[]).map(rowToGoal),
    assets: ((assets.data ?? []) as AssetRow[]).map(rowToAsset),
  };
}

export async function importLocalData(client: SupabaseClient, userId: string, local: FinlyData) {
  const operations = [
    local.transactions.length ? client.from("transactions").insert(local.transactions.map((item) => toTransactionInsert(item, userId))) : Promise.resolve({ error: null }),
    local.goals.length ? client.from("goals").insert(local.goals.map((item) => toGoalInsert(item, userId))) : Promise.resolve({ error: null }),
    local.assets.length ? client.from("assets").insert(local.assets.map((item) => toAssetInsert(item, userId))) : Promise.resolve({ error: null }),
  ];
  const results = await Promise.all(operations);
  results.forEach((result) => assertNoError(result.error));
}

export async function createCloudTransaction(client: SupabaseClient, userId: string, transaction: Omit<Transaction, "id">) {
  const { data, error } = await client.from("transactions").insert(toTransactionInsert(transaction, userId)).select().single();
  assertNoError(error);
  return rowToTransaction(data as TransactionRow);
}

export async function createCloudGoal(client: SupabaseClient, userId: string, goal: Omit<Goal, "id">) {
  const { data, error } = await client.from("goals").insert(toGoalInsert(goal, userId)).select().single();
  assertNoError(error);
  return rowToGoal(data as GoalRow);
}

export async function createCloudAsset(client: SupabaseClient, userId: string, asset: Omit<Asset, "id" | "updatedAt">) {
  const { data, error } = await client.from("assets").insert(toAssetInsert(asset, userId)).select().single();
  assertNoError(error);
  return rowToAsset(data as AssetRow);
}

export async function deleteCloudRow(client: SupabaseClient, table: "transactions" | "goals" | "assets", id: string) {
  const { error } = await client.from(table).delete().eq("id", id);
  assertNoError(error);
}

export async function updateCloudGoal(client: SupabaseClient, id: string, saved: number) {
  const { error } = await client.from("goals").update({ saved_amount: saved }).eq("id", id);
  assertNoError(error);
}

export async function updateCloudAsset(client: SupabaseClient, id: string, value: number, updatedAt: string) {
  const { error } = await client.from("assets").update({ value, updated_at: updatedAt }).eq("id", id);
  assertNoError(error);
}
