import type { FinlyData } from "@/lib/types";

export function createEmptyData(): FinlyData {
  return { transactions: [], goals: [], assets: [] };
}
