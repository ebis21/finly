import { describe, expect, it } from "vitest";
import { walletTotals } from "@/lib/finance";
import type { Goal, Transaction } from "@/lib/types";

function tx(p: Partial<Transaction>): Transaction {
  return {
    id: p.id ?? "t",
    type: p.type ?? "income",
    amount: p.amount ?? 100,
    date: p.date ?? "2026-07-01",
    category: p.category ?? "Inne",
    title: p.title ?? "x",
    note: p.note,
    addedByUserId: p.addedByUserId,
  };
}

const TODAY = "2026-07-18";

describe("walletTotals", () => {
  it("balance = realized income - expense - saved in goals", () => {
    const transactions = [
      tx({ type: "income", amount: 1500, date: "2026-07-01" }),
      tx({ type: "expense", amount: 200, date: "2026-07-05" }),
    ];
    const goals: Goal[] = [{ id: "g", name: "iPad", target: 2500, saved: 100 }];
    const r = walletTotals(transactions, goals, TODAY);
    expect(r.balance).toBe(1200); // 1500 - 200 - 100
    expect(r.savedInGoals).toBe(100);
  });

  it("counts near-future income (within 1 month) as pending, not balance", () => {
    const transactions = [
      tx({ type: "income", amount: 500, date: "2026-08-10" }), // za ~3 tyg.
      tx({ type: "income", amount: 1000, date: "2026-07-01" }),
    ];
    const r = walletTotals(transactions, [], TODAY);
    expect(r.pending).toBe(500);
    expect(r.balance).toBe(1000);
  });

  it("ignores income planned further than 1 month ahead", () => {
    const transactions = [
      tx({ type: "income", amount: 500, date: "2026-12-31" }), // za ~5 mies.
      tx({ type: "income", amount: 2000, date: "2028-07-01" }), // za 2 lata
    ];
    const r = walletTotals(transactions, [], TODAY);
    expect(r.pending).toBe(0);
  });

  it("a parent's goal contribution keeps balance flat (income + saved cancel)", () => {
    // Rodzic dopłaca 300 na cel: +income 300 oraz saved +300 => saldo bez zmian.
    const transactions = [tx({ type: "income", amount: 300, date: "2026-07-10" })];
    const goals: Goal[] = [{ id: "g", name: "Rower", target: 800, saved: 300 }];
    const r = walletTotals(transactions, goals, TODAY);
    expect(r.balance).toBe(0);
  });
});
