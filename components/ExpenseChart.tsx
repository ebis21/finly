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
import { formatPLN } from "@/lib/utils";

const DAYS = 30;

export function ExpenseChart() {
  const { transactions } = useFinly();

  const byDate = new Map<string, number>();
  for (const t of transactions) {
    if (t.type === "expense") {
      byDate.set(t.date, (byDate.get(t.date) ?? 0) + t.amount);
    }
  }

  const data = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    const day = new Date();
    day.setDate(day.getDate() - i);
    const iso = day.toISOString().slice(0, 10);
    data.push({
      label: day.toLocaleDateString("pl-PL", { day: "numeric", month: "short" }),
      amount: byDate.get(iso) ?? 0,
    });
  }

  return (
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
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
            interval={6}
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
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#expenseFill)"
            activeDot={{
              r: 4,
              stroke: "#0c3529",
              strokeWidth: 2,
              fill: "#10b981",
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
