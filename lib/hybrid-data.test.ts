import { describe, expect, it } from "vitest";
import {
  rowToAsset,
  rowToGoal,
  rowToTransaction,
  shouldImportLocalData,
  toAssetInsert,
  toGoalInsert,
  toTransactionInsert,
} from "@/lib/hybrid-data";
import type { FinlyData } from "@/lib/types";

const empty: FinlyData = { transactions: [], goals: [], assets: [] };
const local: FinlyData = {
  transactions: [{ id: "local-t", type: "expense", amount: 12.5, date: "2026-07-17", category: "Inne", title: "Kawa", note: "Na mieście" }],
  goals: [{ id: "local-g", name: "Rower", target: 4000, saved: 250 }],
  assets: [{ id: "local-a", name: "Konto", type: "Gotówka", value: 1200, updatedAt: "2026-07-17" }],
};

describe("shouldImportLocalData", () => {
  it("imports a non-empty local portfolio only into a completely empty cloud", () => {
    expect(shouldImportLocalData(empty, local)).toBe(true);
    expect(shouldImportLocalData(empty, empty)).toBe(false);
    expect(shouldImportLocalData({ ...empty, goals: local.goals }, local)).toBe(false);
  });
});

describe("Supabase row mapping", () => {
  it("maps database names, numeric values and nullable fields", () => {
    expect(rowToTransaction({ id: "t", type: "expense", amount: "19.99", date: "2026-07-17", category: null, description: "Obiad", note: null })).toEqual({
      id: "t", type: "expense", amount: 19.99, date: "2026-07-17", category: "Inne", title: "Obiad", note: undefined,
    });
    expect(rowToGoal({ id: "g", name: "Urlop", target_amount: "5000", saved_amount: "125.50" })).toEqual({ id: "g", name: "Urlop", target: 5000, saved: 125.5 });
    expect(rowToAsset({ id: "a", name: "IKE", type: null, value: "2200", updated_at: "2026-07-17T12:00:00Z" })).toEqual({ id: "a", name: "IKE", type: "Inne", value: 2200, updatedAt: "2026-07-17" });
  });
});

describe("Supabase inserts", () => {
  it("maps local domain records and assigns the authenticated user", () => {
    expect(toTransactionInsert(local.transactions[0], "user-1")).toMatchObject({ user_id: "user-1", description: "Kawa", amount: 12.5 });
    expect(toGoalInsert(local.goals[0], "user-1")).toEqual({ user_id: "user-1", name: "Rower", target_amount: 4000, saved_amount: 250 });
    expect(toAssetInsert(local.assets[0], "user-1")).toMatchObject({ user_id: "user-1", name: "Konto", value: 1200 });
  });
});
