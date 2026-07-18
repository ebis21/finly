"use client";

import { useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Studs } from "@/components/Studs";
import { TransactionChart } from "@/components/TransactionChart";
import { CategoryDashboard } from "@/components/CategoryDashboard";
import { useFinly } from "@/lib/store";
import { cn, formatPLN, todayISO, type Period } from "@/lib/utils";
import type { TransactionType } from "@/lib/types";

function monthKey(offset: number) {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + offset);
  return d.toISOString().slice(0, 7);
}

const PERIOD_LABELS: Record<Period, string> = {
  month: "Miesiąc",
  year: "Rok",
  all: "Wszystko",
};

export default function DashboardPage() {
  const { transactions, goals } = useFinly();
  const [view, setView] = useState<TransactionType>("expense");
  const [period, setPeriod] = useState<Period>("month");

  const today = todayISO();

  const sumFor = (type: "income" | "expense", month?: string) =>
    transactions
      .filter((t) => t.type === type && (!month || t.date.startsWith(month)))
      .reduce((acc, t) => acc + t.amount, 0);

  // Zrealizowane = do dziś włącznie; przyszłe dochody to "Oczekujące".
  const realizedIncome = transactions
    .filter((t) => t.type === "income" && t.date <= today)
    .reduce((acc, t) => acc + t.amount, 0);
  const realizedExpense = transactions
    .filter((t) => t.type === "expense" && t.date <= today)
    .reduce((acc, t) => acc + t.amount, 0);
  const savedInGoals = goals.reduce((acc, g) => acc + g.saved, 0);
  const balance = realizedIncome - realizedExpense - savedInGoals;
  const pending = transactions
    .filter((t) => t.type === "income" && t.date > today)
    .reduce((acc, t) => acc + t.amount, 0);

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
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-white/30 bg-ink/25 px-3 py-1 text-sm font-bold">
            <span className="text-emerald-100/90">Oczekujące</span>
            {formatPLN(pending)}
          </span>
          {savedInGoals > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-white/30 bg-white/10 px-3 py-1 text-xs font-bold text-emerald-50">
              🎯 na cele {formatPLN(savedInGoals)}
            </span>
          )}
        </div>
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

      <div className="grid grid-cols-2 gap-2">
        <ViewButton
          label="Wydatki"
          active={view === "expense"}
          activeClass="border-ink bg-rose-400 text-white shadow-brick-sm"
          onClick={() => setView("expense")}
        />
        <ViewButton
          label="Dochody"
          active={view === "income"}
          activeClass="border-ink bg-brand text-white shadow-brick-sm"
          onClick={() => setView("income")}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        {(Object.keys(PERIOD_LABELS) as Period[]).map((key) => (
          <ViewButton
            key={key}
            label={PERIOD_LABELS[key]}
            active={period === key}
            activeClass="border-ink bg-ink text-white shadow-brick-sm"
            onClick={() => setPeriod(key)}
          />
        ))}
      </div>

      <section className="brick p-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-xl font-bold">
            {view === "expense" ? "Wydatki" : "Dochody"}
          </h2>
          <span className="text-xs font-semibold text-ink/40">
            {PERIOD_LABELS[period]}
          </span>
        </div>
        <div className="mt-2">
          <TransactionChart type={view} period={period} />
        </div>
      </section>

      <CategoryDashboard type={view} period={period} />
    </div>
  );
}

function ViewButton({
  label,
  active,
  activeClass,
  onClick,
}: {
  label: string;
  active: boolean;
  activeClass: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-2xl border-2 py-2.5 font-display text-sm font-bold transition-all",
        active ? activeClass : "border-ink/20 bg-white text-ink/40"
      )}
    >
      {label}
    </button>
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
