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
          <CartesianGrid stroke="#27323d" strokeDasharray="3 3" />
          <XAxis
            dataKey="reportDate"
            minTickGap={24}
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            tickFormatter={formatDate}
          />
          <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} tickFormatter={formatCompactNumber} />
          <Tooltip
            contentStyle={{
              background: "#11161c",
              border: "1px solid #2a3541",
              borderRadius: 8,
              color: "#edf4f8",
              boxShadow: "0 12px 34px rgba(0, 0, 0, 0.32)"
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
            stroke="#14b8a6"
            strokeWidth={2}
            type="monotone"
          />
          <Line
            dataKey="commercialNet"
            dot={false}
            name="Commercial net"
            stroke="#f87171"
            strokeWidth={2}
            type="monotone"
          />
          <Line
            dataKey="openInterest"
            dot={false}
            name="Open interest"
            stroke="#fbbf24"
            strokeWidth={2}
            type="monotone"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
