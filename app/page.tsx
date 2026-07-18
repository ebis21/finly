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
import { occurrencesInRange, sumByType } from "@/lib/recurrence";
import type { TransactionType } from "@/lib/types";

function monthKey(offset: number) {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + offset);
  return d.toISOString().slice(0, 7);
}

// Granice miesiąca "RRRR-MM" jako zakres dat ISO.
function monthBounds(mk: string) {
  const [y, m] = mk.split("-").map(Number);
  const last = new Date(y, m, 0).getDate();
  return { from: `${mk}-01`, to: `${mk}-${String(last).padStart(2, "0")}` };
}

function nextDayISO(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
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

  // Wszystkie wystąpienia (w tym cykliczne) rozwinięte na konkretne dni.
  const earliest = transactions.reduce(
    (min, t) => (t.date < min ? t.date : min),
    today
  );
  const realized = occurrencesInRange(transactions, earliest, today);
  const realizedIncome = sumByType(realized, "income");
  const realizedExpense = sumByType(realized, "expense");
  const savedInGoals = goals.reduce((acc, g) => acc + g.saved, 0);
  // "Mam" = zrealizowane dochody − wydatki − pieniądze odłożone na cele.
  const balance = realizedIncome - realizedExpense - savedInGoals;

  // "Oczekujące" = zaplanowane od jutra do końca roku (przychody − wydatki),
  // wliczając powtarzające się wpłaty i płatności.
  const endOfYear = `${today.slice(0, 4)}-12-31`;
  const future = occurrencesInRange(transactions, nextDayISO(today), endOfYear);
  const pending = sumByType(future, "income") - sumByType(future, "expense");

  const thisMonth = monthKey(0);
  const prevMonth = monthKey(-1);
  const mThis = monthBounds(thisMonth);
  const mPrev = monthBounds(prevMonth);
  const occThis = occurrencesInRange(transactions, mThis.from, mThis.to);
  const occPrev = occurrencesInRange(transactions, mPrev.from, mPrev.to);
  const incomeThis = sumByType(occThis, "income");
  const incomePrev = sumByType(occPrev, "income");
  const expenseThis = sumByType(occThis, "expense");
  const expensePrev = sumByType(occPrev, "expense");

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-3xl border-2 border-ink bg-gradient-to-b from-brand to-brand-dark p-5 text-white shadow-brick-lg">
        <Studs className="text-white/40" />
        <div className="mt-4 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-bold text-emerald-100">Mam</p>
            <p className="font-display text-5xl font-bold tracking-tight">
              {formatPLN(balance)}
            </p>
          </div>
          <div className="shrink-0 rounded-2xl border-2 border-white/25 bg-ink/35 px-3 py-2 text-right">
            <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-100/80">
              Oczekujące
            </p>
            <p className="font-display text-lg font-bold">{formatPLN(pending)}</p>
          </div>
        </div>
        {savedInGoals > 0 && (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border-2 border-white/30 bg-white/10 px-3 py-1 text-xs font-bold text-emerald-50">
            🎯 odłożone na cele {formatPLN(savedInGoals)}
          </p>
        )}
      </section>

      <div className="grid grid-cols-2 gap-4">
        <StatTile
          label="Wpłynęło"
          icon={<TrendingUp className="h-4 w-4 text-brand-dark" />}
          amount={incomeThis}
          amountClass="text-brand-dark"
          prefix="+"
          current={incomeThis}
          previous={incomePrev}
          goodWhenUp
        />
        <StatTile
          label="Wydałem"
          icon={<TrendingDown className="h-4 w-4 text-rose-500" />}
          amount={expenseThis}
          amountClass="text-rose-500"
          current={expenseThis}
          previous={expensePrev}
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

      <section className="brick p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-xl font-bold">
            {view === "expense" ? "Wydatki" : "Dochody"}
          </h2>
          <select
            aria-label="Wybierz okres"
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
            className="rounded-xl border-2 border-ink bg-white px-2.5 py-1 text-xs font-bold text-ink shadow-brick-sm outline-none"
          >
            {(Object.keys(PERIOD_LABELS) as Period[]).map((key) => (
              <option key={key} value={key}>
                {PERIOD_LABELS[key]}
              </option>
            ))}
          </select>
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
