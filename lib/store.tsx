"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Asset, FinlyData, Goal, Transaction } from "@/lib/types";
import { localDataStore } from "@/lib/storage";

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
      // Poprzedni miesiąc — żeby porównania "vs poprzedni miesiąc"
      // i wykres miały dane od pierwszego uruchomienia.
      {
        id: "t5",
        type: "income",
        amount: 3400,
        date: daysAgo(39),
        category: "Wypłata",
        title: "Wypłata z pracy",
      },
      {
        id: "t6",
        type: "expense",
        amount: 310,
        date: daysAgo(36),
        category: "Jedzenie",
        title: "Zakupy na cały tydzień",
      },
      {
        id: "t7",
        type: "expense",
        amount: 150,
        date: daysAgo(33),
        category: "Rozrywka",
        title: "Kino z rodziną",
      },
      {
        id: "t8",
        type: "expense",
        amount: 90,
        date: daysAgo(31),
        category: "Transport",
        title: "Bilet miesięczny",
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

  // Zapis czytamy dopiero po zamontowaniu (SSR nie ma localStorage).
  useEffect(() => {
    void localDataStore.load().then((saved) => {
      if (saved) setData(saved);
      loaded.current = true;
    });
  }, []);

  useEffect(() => {
    if (loaded.current) {
      void localDataStore.save(data);
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
