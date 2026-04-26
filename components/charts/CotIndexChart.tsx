"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { formatDate } from "@/lib/format";

export type CotIndexPoint = {
  reportDate: string;
  cotIndex13: number | null;
  cotIndex26: number | null;
  cotIndex52: number | null;
};

export function CotIndexChart({ data }: { data: CotIndexPoint[] }) {
  if (!data.length) {
    return (
      <div className="flex h-64 items-center justify-center rounded-md border border-dashed border-slate-300 text-sm text-slate-500">
        No COT Index history available.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="#27323d" strokeDasharray="3 3" />
          <XAxis
            dataKey="reportDate"
            minTickGap={24}
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            tickFormatter={formatDate}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            tickFormatter={(value) => `${value}`}
          />
          <ReferenceLine y={80} stroke="#f87171" strokeDasharray="4 4" />
          <ReferenceLine y={20} stroke="#14b8a6" strokeDasharray="4 4" />
          <Tooltip
            contentStyle={{
              background: "#11161c",
              border: "1px solid #2a3541",
              borderRadius: 8,
              color: "#edf4f8",
              boxShadow: "0 12px 34px rgba(0, 0, 0, 0.32)"
            }}
            formatter={(value) =>
              typeof value === "number" ? `${Math.round(value)}/100` : String(value ?? "n/a")
            }
            labelFormatter={(label) => formatDate(String(label))}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line dataKey="cotIndex13" dot={false} name="13w COT Index" stroke="#14b8a6" strokeWidth={2} type="monotone" />
          <Line dataKey="cotIndex26" dot={false} name="26w COT Index" stroke="#fbbf24" strokeWidth={2} type="monotone" />
          <Line dataKey="cotIndex52" dot={false} name="52w COT Index" stroke="#f87171" strokeWidth={2} type="monotone" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
