import { describe, expect, it } from "vitest";
import { createEmptyData } from "@/lib/empty-data";

describe("createEmptyData", () => {
  it("creates a fresh empty portfolio for every new local user", () => {
    const first = createEmptyData();
    const second = createEmptyData();
    expect(first).toEqual({ transactions: [], goals: [], assets: [] });
    first.transactions.push({ id: "t", type: "expense", amount: 1, date: "2026-07-17", category: "Inne", title: "Test" });
    expect(second.transactions).toEqual([]);
  });
});
