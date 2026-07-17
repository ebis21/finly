"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { Studs } from "@/components/Studs";
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
      <section className="rounded-3xl border-2 border-ink bg-gradient-to-b from-brand to-brand-dark p-5 text-white shadow-brick-lg">
        <Studs className="text-white/40" />
        <p className="mt-4 text-sm font-bold text-emerald-100">Mam</p>
        <p className="font-display text-5xl font-bold tracking-tight">
          {formatPLN(balance)}
        </p>
      </section>

      <div className="grid grid-cols-2 gap-4">
        <section className="brick p-4">
          <div className="flex items-center gap-1.5 text-sm font-bold text-ink/60">
            <TrendingUp className="h-4 w-4 text-brand-dark" />
            Wpłynęło
          </div>
          <p className="mt-1 font-display text-2xl font-bold text-brand-dark">
            +{formatPLN(sum("income", true))}
          </p>
          <p className="text-xs font-semibold text-ink/40">w tym miesiącu</p>
        </section>
        <section className="brick p-4">
          <div className="flex items-center gap-1.5 text-sm font-bold text-ink/60">
            <TrendingDown className="h-4 w-4 text-rose-500" />
            Wydałem
          </div>
          <p className="mt-1 font-display text-2xl font-bold text-rose-500">
            {formatPLN(sum("expense", true))}
          </p>
          <p className="text-xs font-semibold text-ink/40">w tym miesiącu</p>
        </section>
      </div>

      <section>
        <h2 className="mb-2 font-display text-xl font-bold">Transakcje</h2>
        <TransactionList />
      </section>
    </div>
  );
}
