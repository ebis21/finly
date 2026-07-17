import type { FinlyData } from "@/lib/types";

// Warstwa dostępu do danych. MVP trzyma wszystko w localStorage;
// po dodaniu kont ten sam interfejs zaimplementuje adapter bazy
// (np. Supabase) — reszta aplikacji nie musi się wtedy zmieniać.
export interface DataStore {
  load(): Promise<FinlyData | null>;
  save(data: FinlyData): Promise<void>;
}

const STORAGE_KEY = "finly-data-v1";

export const localDataStore: DataStore = {
  async load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as FinlyData) : null;
    } catch {
      return null;
    }
  },
  async save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },
};
