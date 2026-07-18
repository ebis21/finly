import { describe, expect, it } from "vitest";
import { addPeriod, occurrencesInRange, sumByType } from "@/lib/recurrence";
import type { Transaction } from "@/lib/types";

function tx(partial: Partial<Transaction>): Transaction {
  return {
    id: partial.id ?? "1",
    type: partial.type ?? "income",
    amount: partial.amount ?? 100,
    date: partial.date ?? "2026-01-15",
    category: partial.category ?? "Wypłata",
    title: partial.title ?? "Test",
    note: partial.note,
    recurrence: partial.recurrence,
  };
}

describe("addPeriod", () => {
  it("adds a month and rolls over the year", () => {
    expect(addPeriod("2026-12-10", "monthly")).toBe("2027-01-10");
  });

  it("clamps the day to the target month length", () => {
    expect(addPeriod("2026-01-31", "monthly")).toBe("2026-02-28");
  });

  it("adds a year", () => {
    expect(addPeriod("2026-03-01", "yearly")).toBe("2027-03-01");
  });
});

describe("occurrencesInRange", () => {
  it("includes a one-off transaction only when inside the range", () => {
    const t = [tx({ date: "2026-05-10" })];
    expect(occurrencesInRange(t, "2026-05-01", "2026-05-31")).toHaveLength(1);
    expect(occurrencesInRange(t, "2026-06-01", "2026-06-30")).toHaveLength(0);
  });

  it("expands a monthly transaction across the range", () => {
    const t = [tx({ date: "2026-01-15", recurrence: "monthly", amount: 1000 })];
    const occ = occurrencesInRange(t, "2026-01-01", "2026-06-30");
    // sty, lut, mar, kwi, maj, cze
    expect(occ).toHaveLength(6);
    expect(sumByType(occ, "income")).toBe(6000);
  });

  it("does not start a recurring series before its anchor date", () => {
    const t = [tx({ date: "2026-04-15", recurrence: "monthly" })];
    const occ = occurrencesInRange(t, "2026-01-01", "2026-12-31");
    expect(occ.every((o) => o.date >= "2026-04-15")).toBe(true);
  });

  it("returns nothing when from is after to", () => {
    const t = [tx({ date: "2026-05-10" })];
    expect(occurrencesInRange(t, "2026-12-31", "2026-01-01")).toHaveLength(0);
  });
});
