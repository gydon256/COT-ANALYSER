import { clsx } from "clsx";
import type { CotSignal } from "@/lib/cot/analytics";

const classes: Record<CotSignal, string> = {
  "Crowded Long": "border-teal-200 bg-teal-50 text-teal-900",
  "Crowded Short": "border-red-200 bg-red-50 text-red-800",
  "Crowded Long Weakening": "border-amber-200 bg-amber-50 text-amber-900",
  "Crowded Short Unwinding": "border-amber-200 bg-amber-50 text-amber-900",
  "Bullish Weekly Shift": "border-teal-200 bg-teal-50 text-teal-900",
  "Bearish Weekly Shift": "border-red-200 bg-red-50 text-red-800",
  Neutral: "border-slate-200 bg-slate-50 text-slate-700",
  "Not Enough History": "border-slate-200 bg-slate-100 text-slate-500"
};

export function SignalPill({ signal, title }: { signal: CotSignal; title?: string }) {
  return (
    <span
      className={clsx("inline-flex rounded-md border px-2.5 py-1 text-xs font-bold", classes[signal])}
      title={title}
    >
      {signal}
    </span>
  );
}
