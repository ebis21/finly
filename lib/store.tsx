"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Asset, Goal, Transaction } from "@/lib/types";

interface FinlyData {
  transactions: Transaction[];
  goals: Goal[];
  assets: Asset[];
}

interface FinlyContextValue extends FinlyData {
  addTransaction: (t: Omit<Transaction, "id">) => void;
  removeTransaction: (id: string) => void;
  addGoal: (g: Omit<Goal, "id">) => void;
  removeGoal: (id: string) => void;
  depositToGoal: (id: string, amount: number) => void;
  addAsset: (a: Omit<Asset, "id" | "updatedAt">) => void;
  removeAsset: (id: string) => void;
  updateAssetValue: (id: string, value: number) => void;
  addOpen: boolean;
  setAddOpen: (open: boolean) => void;
}

const STORAGE_KEY = "finly-data-v1";

function daysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

// Przykładowe dane demo — ładowane tylko, gdy w przeglądarce nie ma zapisu.
function seedData(): FinlyData {
  return {
    transactions: [
      {
        id: "t1",
        type: "income",
        amount: 3500,
        date: daysAgo(9),
        category: "Wypłata",
        title: "Wypłata z pracy",
        note: "Stała miesięczna pensja.",
      },
      {
        id: "t2",
        type: "expense",
        amount: 120,
        date: daysAgo(4),
        category: "Prezenty",
        title: "Prezent dla mamy",
        note: "Urodziny mamy — kwiaty i książka 🎁",
      },
      {
        id: "t3",
        type: "income",
        amount: 100,
        date: daysAgo(2),
        category: "Sprzedaż",
        title: "Sprzedaż lemoniady",
      },
      {
        id: "t4",
        type: "expense",
        amount: 85.5,
        date: daysAgo(1),
        category: "Jedzenie",
        title: "Zakupy spożywcze",
      },
    ],
    goals: [
      { id: "g1", name: "iPad", target: 3500, saved: 1200 },
      { id: "g2", name: "Wakacje nad morzem", target: 2000, saved: 450 },
    ],
    assets: [
      {
        id: "a1",
        name: "Gotówka w portfelu",
        type: "Gotówka",
        value: 250,
        updatedAt: daysAgo(0),
      },
      {
        id: "a2",
        name: "Konto oszczędnościowe",
        type: "Oszczędności",
        value: 4150,
        updatedAt: daysAgo(3),
      },
      {
        id: "a3",
        name: "Rower",
        type: "Sprzęt",
        value: 800,
        updatedAt: daysAgo(30),
      },
    ],
  };
}

const FinlyContext = createContext<FinlyContextValue | null>(null);

export function FinlyProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<FinlyData>(seedData);
  const [addOpen, setAddOpen] = useState(false);
  const loaded = useRef(false);

  // localStorage czytamy dopiero po zamontowaniu (SSR go nie ma).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setData(JSON.parse(raw));
    } catch {
      // uszkodzony zapis — zostajemy przy danych demo
    }
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (loaded.current) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data]);

  const value: FinlyContextValue = {
    ...data,
    addOpen,
    setAddOpen,
    addTransaction: (t) =>
      setData((d) => ({
        ...d,
        transactions: [{ ...t, id: crypto.randomUUID() }, ...d.transactions],
      })),
    removeTransaction: (id) =>
      setData((d) => ({
        ...d,
        transactions: d.transactions.filter((t) => t.id !== id),
      })),
    addGoal: (g) =>
      setData((d) => ({
        ...d,
        goals: [...d.goals, { ...g, id: crypto.randomUUID() }],
      })),
    removeGoal: (id) =>
      setData((d) => ({ ...d, goals: d.goals.filter((g) => g.id !== id) })),
    depositToGoal: (id, amount) =>
      setData((d) => ({
        ...d,
        goals: d.goals.map((g) =>
          g.id === id ? { ...g, saved: g.saved + amount } : g
        ),
      })),
    addAsset: (a) =>
      setData((d) => ({
        ...d,
        assets: [
          ...d.assets,
          { ...a, id: crypto.randomUUID(), updatedAt: daysAgo(0) },
        ],
      })),
    removeAsset: (id) =>
      setData((d) => ({ ...d, assets: d.assets.filter((a) => a.id !== id) })),
    updateAssetValue: (id, newValue) =>
      setData((d) => ({
        ...d,
        assets: d.assets.map((a) =>
          a.id === id ? { ...a, value: newValue, updatedAt: daysAgo(0) } : a
        ),
      })),
  };

  return (
    <FinlyContext.Provider value={value}>{children}</FinlyContext.Provider>
  );
}

export function useFinly() {
  const ctx = useContext(FinlyContext);
  if (!ctx) throw new Error("useFinly musi być użyte wewnątrz FinlyProvider");
  return ctx;
}
