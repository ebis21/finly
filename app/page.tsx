"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { TransactionList } from "@/components/TransactionList";
import { useFinly } from "@/lib/store";
import { formatPLN } from "@/lib/utils";

export default function DashboardPage() {
  const { transactions } = useFinly();

  const sum = (type: "income" | "expense", monthOnly = false) => {
    const month = new Date().toISOString().slice(0, 7);
    return transactions
      .filter((t) => t.type === type && (!monthOnly || t.date.startsWith(month)))
      .reduce((acc, t) => acc + t.amount, 0);
  };

  const balance = sum("income") - sum("expense");

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-3xl bg-gradient-to-br from-brand to-brand-dark p-6 text-white shadow-lg shadow-brand/30">
        <p className="text-sm font-medium text-emerald-100">Mam</p>
        <p className="mt-1 text-4xl font-bold tracking-tight">
          {formatPLN(balance)}
        </p>
      </section>

      <div className="grid grid-cols-2 gap-4">
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <TrendingUp className="h-4 w-4 text-brand-dark" />
            Wpłynęło
          </div>
          <p className="mt-2 text-2xl font-bold text-brand-dark">
            +{formatPLN(sum("income", true))}
          </p>
          <p className="text-xs text-slate-400">w tym miesiącu</p>
        </section>
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <TrendingDown className="h-4 w-4 text-rose-500" />
            Wydałem
          </div>
          <p className="mt-2 text-2xl font-bold text-rose-500">
            {formatPLN(sum("expense", true))}
          </p>
          <p className="text-xs text-slate-400">w tym miesiącu</p>
        </section>
      </div>

      <section>
        <h2 className="mb-2 text-lg font-bold">Transakcje</h2>
        <TransactionList />
      </section>
    </div>
  );
}
