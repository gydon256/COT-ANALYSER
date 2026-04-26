import { SubmitButton } from "@/components/ui/SubmitButton";
import { updateWatchlistItemWorkflowAction } from "@/lib/actions/watchlists";
import type { WatchlistItem } from "@/lib/types";

const checks = [
  { key: "bias", label: "COT bias agrees with trade direction" },
  { key: "level", label: "Key level / liquidity area is marked" },
  { key: "trigger", label: "Entry trigger has printed" },
  { key: "risk", label: "Stop, target, and risk are defined" }
] as const;

export function TradeWorkflowForm({
  item,
  returnTo
}: {
  item: Pick<WatchlistItem, "id" | "bias_label" | "notes" | "checklist">;
  returnTo: string;
}) {
  const checklist = item.checklist ?? {};
  const readyCount = checks.filter((check) => Boolean(checklist[check.key])).length;

  return (
    <form action={updateWatchlistItemWorkflowAction} className="grid gap-4">
      <input name="itemId" type="hidden" value={item.id} />
      <input name="returnTo" type="hidden" value={returnTo} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-950">Trade workflow</h2>
          <p className="mt-1 text-sm text-slate-600">
            {readyCount}/4 ready. COT is a filter, not the entry trigger.
          </p>
        </div>
        <label className="grid gap-2 text-sm font-medium text-slate-800">
          <span>Bias label</span>
          <select
            className="min-h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            defaultValue={item.bias_label}
            name="biasLabel"
          >
            <option value="waiting">Waiting</option>
            <option value="bullish">Bullish</option>
            <option value="bearish">Bearish</option>
            <option value="neutral">Neutral</option>
          </select>
        </label>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {checks.map((check) => (
          <label
            key={check.key}
            className="flex min-h-11 items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700"
          >
            <input
              className="size-4 accent-teal-700"
              defaultChecked={Boolean(checklist[check.key])}
              name={`check_${check.key}`}
              type="checkbox"
            />
            {check.label}
          </label>
        ))}
      </div>

      <label className="grid gap-2 text-sm font-medium text-slate-800">
        <span>Notes</span>
        <textarea
          className="min-h-28 rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
          defaultValue={item.notes}
          maxLength={4000}
          name="notes"
          placeholder="Technical model notes for this market"
          rows={4}
        />
      </label>

      <SubmitButton className="w-full sm:w-auto" pendingLabel="Saving workflow...">
        Save workflow
      </SubmitButton>
    </form>
  );
}
