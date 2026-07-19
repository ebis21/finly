"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useFinly } from "@/lib/store";
import { formatPLN, todayISO, type Period } from "@/lib/utils";
import { occurrencesInRange, type Occurrence } from "@/lib/recurrence";
import type { Transaction, TransactionType } from "@/lib/types";

// Kolor podąża za typem w całej aplikacji: dochody emerald, wydatki rose.
const LINE_COLOR: Record<TransactionType, string> = {
  income: "#10b981",
  expense: "#f43f5e",
};

interface Point {
  label: string;
  amount: number;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function bucket(occurrences: Occurrence[], slice: number) {
  const map = new Map<string, number>();
  for (const o of occurrences) {
    const key = o.date.slice(0, slice);
    map.set(key, (map.get(key) ?? 0) + o.amount);
  }
  return map;
}

// Buduje serię wykresu wg okresu: dni bieżącego miesiąca, miesiące roku
// albo miesiące od pierwszej transakcji (Wszystko). Uwzględnia transakcje
// cykliczne (rozwinięte na poszczególne dni w zakresie).
function buildSeries(
  transactions: Transaction[],
  type: TransactionType,
  period: Period
): Point[] {
  const now = new Date();
  const year = now.getFullYear();

  if (period === "month") {
    const month = now.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const from = `${year}-${pad(month + 1)}-01`;
    // Do dziś — przyszłe dni miesiąca zostają puste, aż realnie nadejdą.
    const occ = occurrencesInRange(transactions, from, todayISO()).filter(
      (o) => o.type === type
    );
    const map = bucket(occ, 10);
    const points: Point[] = [];
    for (let d = 1; d <= days; d++) {
      const iso = `${year}-${pad(month + 1)}-${pad(d)}`;
      points.push({ label: String(d), amount: map.get(iso) ?? 0 });
    }
    return points;
  }

  if (period === "year") {
    const occ = occurrencesInRange(
      transactions,
      `${year}-01-01`,
      todayISO() // przyszłe miesiące roku pozostają puste do czasu ich nadejścia
    ).filter((o) => o.type === type);
    const map = bucket(occ, 7);
    const points: Point[] = [];
    for (let m = 0; m < 12; m++) {
      const key = `${year}-${pad(m + 1)}`;
      const label = new Date(year, m, 1).toLocaleDateString("pl-PL", {
        month: "short",
      });
      points.push({ label, amount: map.get(key) ?? 0 });
    }
    return points;
  }

  // "all": miesiące od pierwszej transakcji do teraz.
  const items = transactions.filter((t) => t.type === type);
  if (items.length === 0) return [];
  const first = items.reduce((min, t) => (t.date < min ? t.date : min), items[0].date);
  const startYear = Number(first.slice(0, 4));
  const startMonth = Number(first.slice(5, 7)) - 1;
  const occ = occurrencesInRange(
    transactions,
    `${first.slice(0, 7)}-01`,
    todayISO() // tylko do dziś — bez rozwijania cyklicznych na przyszłość
  ).filter((o) => o.type === type);
  const map = bucket(occ, 7);
  const points: Point[] = [];
  const cursor = new Date(startYear, startMonth, 1);
  const end = new Date(year, now.getMonth(), 1);
  while (cursor <= end) {
    const key = `${cursor.getFullYear()}-${pad(cursor.getMonth() + 1)}`;
    const label = cursor.toLocaleDateString("pl-PL", {
      month: "short",
      year: "2-digit",
    });
    points.push({ label, amount: map.get(key) ?? 0 });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return points;
}

export function TransactionChart({
  type,
  period,
}: {
  type: TransactionType;
  period: Period;
}) {
  const { transactions } = useFinly();

  const data = buildSeries(transactions, type, period);
  const tickInterval =
    period === "month" ? 6 : period === "year" ? 0 : "preserveStartEnd";

  const color = LINE_COLOR[type];
  const gradientId = `fill-${type}`;

  return (
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="#0c3529"
            strokeOpacity={0.08}
          />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            interval={tickInterval}
            tick={{ fontSize: 11, fill: "#0c3529", fillOpacity: 0.5 }}
          />
          <YAxis hide domain={[0, "dataMax"]} />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{
              stroke: "#0c3529",
              strokeOpacity: 0.3,
              strokeDasharray: "4 4",
            }}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            activeDot={{
              r: 4,
              stroke: "#0c3529",
              strokeWidth: 2,
              fill: color,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { label: string; amount: number } }>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-xl border-2 border-ink bg-white px-3 py-2 shadow-brick-sm">
      <p className="text-xs font-bold text-ink/50">{point.label}</p>
      <p className="font-display text-sm font-bold">{formatPLN(point.amount)}</p>
    </div>
  );
}
