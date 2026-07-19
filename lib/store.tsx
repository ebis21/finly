"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  createCloudAsset,
  createCloudGoal,
  createCloudTransaction,
  deleteCloudRow,
  importLocalData,
  loadCloudData,
  updateCloudAsset,
  updateCloudGoal,
} from "@/lib/cloud-store";
import { shouldImportLocalData } from "@/lib/hybrid-data";
import { createEmptyData } from "@/lib/empty-data";
import { localDataStore } from "@/lib/storage";
import { requireSupabase } from "@/lib/supabase";
import type { Asset, FinlyData, Goal, Transaction } from "@/lib/types";

interface OperationResult { error: string | null }

interface FinlyContextValue extends FinlyData {
  loading: boolean;
  error: string | null;
  retry: () => void;
  addTransaction: (transaction: Omit<Transaction, "id">) => Promise<OperationResult>;
  removeTransaction: (id: string) => Promise<OperationResult>;
  addGoal: (goal: Omit<Goal, "id">) => Promise<OperationResult>;
  removeGoal: (id: string) => Promise<OperationResult>;
  depositToGoal: (id: string, amount: number) => Promise<OperationResult>;
  addAsset: (asset: Omit<Asset, "id" | "updatedAt">) => Promise<OperationResult>;
  removeAsset: (id: string) => Promise<OperationResult>;
  updateAssetValue: (id: string, value: number) => Promise<OperationResult>;
  addOpen: boolean;
  setAddOpen: (open: boolean) => void;
}

function errorMessage() {
  return "Nie udało się zapisać danych. Sprawdź połączenie i spróbuj ponownie.";
}

const FinlyContext = createContext<FinlyContextValue | null>(null);

export function FinlyProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<FinlyData>(createEmptyData);
  const dataRef = useRef(data);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);
  const [addOpen, setAddOpen] = useState(false);
  const busyGoals = useRef(new Set<string>());

  useEffect(() => { dataRef.current = data; }, [data]);

  useEffect(() => {
    if (authLoading) return;
    let active = true;
    setLoading(true);
    setError(null);

    void (async () => {
      try {
        const local = (await localDataStore.load()) ?? createEmptyData();
        if (!user) {
          if (active) setData(local);
          return;
        }
        const client = requireSupabase();
        let cloud = await loadCloudData(client, user.id);
        if (shouldImportLocalData(cloud, local)) {
          await importLocalData(client, user.id, local);
          cloud = await loadCloudData(client, user.id);
        }
        if (active) setData(cloud);
      } catch {
        if (active) setError("Nie udało się wczytać danych z chmury. Spróbuj ponownie.");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, [authLoading, retryNonce, user]);

  async function saveLocal(next: FinlyData) {
    await localDataStore.save(next);
    dataRef.current = next;
    setData(next);
  }

  async function perform(operation: () => Promise<void>): Promise<OperationResult> {
    setError(null);
    try {
      await operation();
      return { error: null };
    } catch {
      const message = errorMessage();
      setError(message);
      return { error: message };
    }
  }

  const value: FinlyContextValue = {
    ...data,
    loading,
    error,
    retry: () => setRetryNonce((value) => value + 1),
    addOpen,
    setAddOpen,

    addTransaction: (transaction) => perform(async () => {
      if (user) {
        const created = await createCloudTransaction(requireSupabase(), user.id, transaction);
        setData((current) => ({ ...current, transactions: [created, ...current.transactions] }));
      } else {
        await saveLocal({ ...dataRef.current, transactions: [{ ...transaction, id: crypto.randomUUID() }, ...dataRef.current.transactions] });
      }
    }),
    removeTransaction: (id) => perform(async () => {
      if (user) await deleteCloudRow(requireSupabase(), "transactions", id);
      const next = { ...dataRef.current, transactions: dataRef.current.transactions.filter((item) => item.id !== id) };
      if (user) setData(next); else await saveLocal(next);
    }),
    addGoal: (goal) => perform(async () => {
      if (user) {
        const created = await createCloudGoal(requireSupabase(), user.id, goal);
        setData((current) => ({ ...current, goals: [...current.goals, created] }));
      } else {
        await saveLocal({ ...dataRef.current, goals: [...dataRef.current.goals, { ...goal, id: crypto.randomUUID() }] });
      }
    }),
    removeGoal: (id) => perform(async () => {
      if (user) await deleteCloudRow(requireSupabase(), "goals", id);
      const next = { ...dataRef.current, goals: dataRef.current.goals.filter((item) => item.id !== id) };
      if (user) setData(next); else await saveLocal(next);
    }),
    depositToGoal: (id, amount) => perform(async () => {
      if (busyGoals.current.has(id)) throw new Error("busy");
      busyGoals.current.add(id);
      try {
        const goal = dataRef.current.goals.find((item) => item.id === id);
        if (!goal) return;
        const saved = goal.saved + amount;
        if (user) await updateCloudGoal(requireSupabase(), id, saved);
        const next = { ...dataRef.current, goals: dataRef.current.goals.map((item) => item.id === id ? { ...item, saved } : item) };
        if (user) setData(next); else await saveLocal(next);
      } finally {
        busyGoals.current.delete(id);
      }
    }),
    addAsset: (asset) => perform(async () => {
      if (user) {
        const created = await createCloudAsset(requireSupabase(), user.id, asset);
        setData((current) => ({ ...current, assets: [...current.assets, created] }));
      } else {
        await saveLocal({ ...dataRef.current, assets: [...dataRef.current.assets, { ...asset, id: crypto.randomUUID(), updatedAt: new Date().toISOString().slice(0, 10) }] });
      }
    }),
    removeAsset: (id) => perform(async () => {
      if (user) await deleteCloudRow(requireSupabase(), "assets", id);
      const next = { ...dataRef.current, assets: dataRef.current.assets.filter((item) => item.id !== id) };
      if (user) setData(next); else await saveLocal(next);
    }),
    updateAssetValue: (id, newValue) => perform(async () => {
      const updatedAt = new Date().toISOString();
      if (user) await updateCloudAsset(requireSupabase(), id, newValue, updatedAt);
      const next = { ...dataRef.current, assets: dataRef.current.assets.map((item) => item.id === id ? { ...item, value: newValue, updatedAt: updatedAt.slice(0, 10) } : item) };
      if (user) setData(next); else await saveLocal(next);
    }),
  };

  return (
    <FinlyContext.Provider value={value}>
      {children}
      {error && (
        <div role="alert" className="fixed bottom-24 left-1/2 z-30 flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center gap-3 rounded-2xl border-2 border-ink bg-amber-100 p-3 text-sm font-bold shadow-brick">
          <span className="flex-1">{error}</span>
          <button type="button" className="underline" onClick={() => setRetryNonce((value) => value + 1)}>Ponów</button>
        </div>
      )}
    </FinlyContext.Provider>
  );
}

export function useFinly() {
  const context = useContext(FinlyContext);
  if (!context) throw new Error("useFinly musi być użyte wewnątrz FinlyProvider");
  return context;
}
