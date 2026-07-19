import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { importLocalData, loadCloudData } from "@/lib/cloud-store";
import type { FinlyData } from "@/lib/types";

function loadClient(results: Record<string, { data: unknown[] | null; error: { message: string } | null }>) {
  return {
    from(table: string) {
      return {
        select() {
          return {
            eq() {
              return { order: vi.fn().mockResolvedValue(results[table]) };
            },
          };
        },
      };
    },
  } as unknown as SupabaseClient;
}

describe("loadCloudData", () => {
  it("maps all collections and rejects a table error", async () => {
    const ok = loadClient({
      transactions: { data: [{ id: "t", type: "income", amount: "10", date: "2026-07-17", category: null, description: "Zwrot", note: null }], error: null },
      goals: { data: [], error: null },
      assets: { data: [], error: null },
    });
    await expect(loadCloudData(ok, "user-9")).resolves.toMatchObject({ transactions: [{ amount: 10, title: "Zwrot" }] });

    const failing = loadClient({
      transactions: { data: [], error: null },
      goals: { data: null, error: { message: "RLS denied" } },
      assets: { data: [], error: null },
    });
    await expect(loadCloudData(failing, "user-9")).rejects.toThrow("RLS denied");
  });
});

describe("importLocalData", () => {
  it("inserts every local collection with the authenticated user id", async () => {
    const inserted: Record<string, unknown[]> = {};
    const client = {
      from(table: string) {
        return {
          insert(rows: unknown[]) {
            inserted[table] = rows;
            return Promise.resolve({ error: null });
          },
        };
      },
    } as unknown as SupabaseClient;
    const local: FinlyData = {
      transactions: [{ id: "t", type: "expense", amount: 20, date: "2026-07-17", category: "Inne", title: "Kawa" }],
      goals: [{ id: "g", name: "Rower", target: 1000, saved: 10 }],
      assets: [{ id: "a", name: "Konto", type: "Gotówka", value: 50, updatedAt: "2026-07-17" }],
    };
    await importLocalData(client, "user-7", local);
    expect(inserted.transactions[0]).toMatchObject({ user_id: "user-7", description: "Kawa" });
    expect(inserted.goals[0]).toMatchObject({ user_id: "user-7", name: "Rower" });
    expect(inserted.assets[0]).toMatchObject({ user_id: "user-7", name: "Konto" });
  });

  it("surfaces a partial insert failure", async () => {
    const client = {
      from(table: string) {
        return { insert: () => Promise.resolve({ error: table === "goals" ? { message: "goal insert failed" } : null }) };
      },
    } as unknown as SupabaseClient;
    const local: FinlyData = { transactions: [], goals: [{ id: "g", name: "Cel", target: 10, saved: 0 }], assets: [] };
    await expect(importLocalData(client, "user-1", local)).rejects.toThrow("goal insert failed");
  });
});
