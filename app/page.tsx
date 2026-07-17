"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Studs } from "@/components/Studs";
import { ExpenseChart } from "@/components/ExpenseChart";
import { ExpenseDashboard } from "@/components/ExpenseDashboard";
import { useFinly } from "@/lib/store";
import { cn, formatPLN } from "@/lib/utils";

function monthKey(offset: number) {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + offset);
  return d.toISOString().slice(0, 7);
}

export default function DashboardPage() {
  const { transactions } = useFinly();

  const sumFor = (type: "income" | "expense", month?: string) =>
    transactions
      .filter((t) => t.type === type && (!month || t.date.startsWith(month)))
      .reduce((acc, t) => acc + t.amount, 0);

  const balance = sumFor("income") - sumFor("expense");
  const thisMonth = monthKey(0);
  const prevMonth = monthKey(-1);

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
        <StatTile
          label="Wpłynęło"
          icon={<TrendingUp className="h-4 w-4 text-brand-dark" />}
          amount={sumFor("income", thisMonth)}
          amountClass="text-brand-dark"
          prefix="+"
          current={sumFor("income", thisMonth)}
          previous={sumFor("income", prevMonth)}
          goodWhenUp
        />
        <StatTile
          label="Wydałem"
          icon={<TrendingDown className="h-4 w-4 text-rose-500" />}
          amount={sumFor("expense", thisMonth)}
          amountClass="text-rose-500"
          current={sumFor("expense", thisMonth)}
          previous={sumFor("expense", prevMonth)}
          goodWhenUp={false}
        />
      </div>

      <section className="brick p-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-xl font-bold">Wydatki</h2>
          <span className="text-xs font-semibold text-ink/40">
            ostatnie 30 dni
          </span>
        </div>
        <div className="mt-2">
          <ExpenseChart />
        </div>
      </section>

      <ExpenseDashboard />
    </div>
  );
}

function StatTile({
  label,
  icon,
  amount,
  amountClass,
  prefix = "",
  current,
  previous,
  goodWhenUp,
}: {
  label: string;
  icon: React.ReactNode;
  amount: number;
  amountClass: string;
  prefix?: string;
  current: number;
  previous: number;
  goodWhenUp: boolean;
}) {
  return (
    <section className="brick p-4">
      <div className="flex items-center gap-1.5 text-sm font-bold text-ink/60">
        {icon}
        {label}
      </div>
      <p className={cn("mt-1 font-display text-2xl font-bold", amountClass)}>
        {prefix}
        {formatPLN(amount)}
      </p>
      <div className="mt-1 flex items-center gap-1.5">
        <DeltaPill current={current} previous={previous} goodWhenUp={goodWhenUp} />
        <span className="text-xs font-semibold text-ink/40">
          vs poprzedni miesiąc
        </span>
      </div>
    </section>
  );
}

function DeltaPill({
  current,
  previous,
  goodWhenUp,
}: {
  current: number;
  previous: number;
  goodWhenUp: boolean;
}) {
  if (previous <= 0) {
    return <span className="text-xs font-bold text-ink/40">—</span>;
  }
  const pct = Math.round(((current - previous) / previous) * 100);
  const up = pct >= 0;
  const good = up === goodWhenUp;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border-2 border-ink px-1.5 py-px text-[10px] font-bold",
        good ? "bg-brand-light text-brand-dark" : "bg-rose-100 text-rose-500"
      )}
    >
      {up ? (
        <ArrowUpRight className="h-3 w-3" />
      ) : (
        <ArrowDownRight className="h-3 w-3" />
      )}
      {Math.abs(pct)}%
    </span>
  );
}
