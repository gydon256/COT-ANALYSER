"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { formatCompactNumber, formatDate, formatNumber } from "@/lib/format";

export type PositioningPoint = {
  reportDate: string;
  nonCommercialNet: number | null;
  commercialNet: number | null;
  openInterest: number | null;
};

type PositioningChartProps = {
  data: PositioningPoint[];
};

export function PositioningChart({ data }: PositioningChartProps) {
  if (!data.length) {
    return (
      <div className="flex h-64 items-center justify-center rounded-md border border-dashed border-slate-300 text-sm text-slate-500">
        No report history available.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <XAxis
            dataKey="reportDate"
            minTickGap={24}
            tick={{ fill: "#64748b", fontSize: 12 }}
            tickFormatter={formatDate}
          />
          <YAxis tick={{ fill: "#64748b", fontSize: 12 }} tickFormatter={formatCompactNumber} />
          <Tooltip
            contentStyle={{
              border: "1px solid #cbd5e1",
              borderRadius: 8,
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.12)"
            }}
            formatter={(value) =>
              typeof value === "number" ? formatNumber(value) : String(value ?? "n/a")
            }
            labelFormatter={(label) => formatDate(String(label))}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            dataKey="nonCommercialNet"
            dot={false}
            name="Non-commercial net"
            stroke="#0f766e"
            strokeWidth={2}
            type="monotone"
          />
          <Line
            dataKey="commercialNet"
            dot={false}
            name="Commercial net"
            stroke="#b91c1c"
            strokeWidth={2}
            type="monotone"
          />
          <Line
            dataKey="openInterest"
            dot={false}
            name="Open interest"
            stroke="#475569"
            strokeWidth={2}
            type="monotone"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
