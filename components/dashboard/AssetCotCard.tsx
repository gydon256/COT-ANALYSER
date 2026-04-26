import { Trash2 } from "lucide-react";
import Link from "next/link";
import { PositioningChart, type PositioningPoint } from "@/components/charts/PositioningChart";
import { SignalPill } from "@/components/dashboard/SignalPill";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { removeWatchlistItemAction } from "@/lib/actions/watchlists";
import { analyzeCot } from "@/lib/cot/analytics";
import { formatCompactNumber, formatDate, formatNumber } from "@/lib/format";
import type { Asset, CotReport, WatchlistItem } from "@/lib/types";

type AssetCotCardProps = {
  asset: Asset;
  item: Pick<WatchlistItem, "id" | "bias_label" | "notes" | "checklist">;
  reports: CotReport[];
};

export function AssetCotCard({ asset, item, reports }: AssetCotCardProps) {
  const latest = reports.at(-1);
  const analysis = analyzeCot(asset, reports);
  const checklist = item.checklist ?? {};
  const readyCount = ["bias", "level", "trigger", "risk"].filter(
    (key) => Boolean(checklist[key as keyof typeof checklist])
  ).length;
  const chartData: PositioningPoint[] = reports.map((report) => ({
    reportDate: report.report_date,
    nonCommercialNet: report.non_commercial_net,
    commercialNet: report.commercial_net,
    openInterest: report.open_interest
  }));

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              className="text-xl font-bold text-slate-950 hover:text-teal-800"
              href={`/dashboard/assets/${encodeURIComponent(asset.symbol)}`}
            >
              {asset.symbol}
            </Link>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
              {asset.category ?? "Market"}
            </span>
            <SignalPill signal={analysis.signal} title={analysis.explanation} />
          </div>
          <p className="mt-1 text-sm font-medium text-slate-700">{asset.display_name}</p>
          <p className="mt-1 text-xs text-slate-500">{asset.cftc_market_name}</p>
        </div>
        <form action={removeWatchlistItemAction}>
          <input name="itemId" type="hidden" value={item.id} />
          <Button type="submit" variant="secondary">
            <Trash2 size={16} aria-hidden="true" />
            Remove
          </Button>
        </form>
      </CardHeader>
      <CardBody className="grid gap-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Summary label="Report date" value={formatDate(latest?.report_date)} />
          <Summary label="Open interest" value={formatNumber(latest?.open_interest)} />
          <Summary label="Adjusted net" value={formatCompactNumber(analysis.latest?.adjustedNet)} />
          <Summary label="52w COT Index" value={analysis.cotIndex52 == null ? "n/a" : `${Math.round(analysis.cotIndex52)}/100`} />
        </div>
        <div className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 md:grid-cols-[180px_1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Workflow</p>
            <p className="mt-1 font-bold capitalize text-slate-950">{item.bias_label}</p>
            <p className="mt-1 text-xs text-slate-500">{readyCount}/4 checklist ready</p>
          </div>
          <p className="leading-6 text-slate-600">
            {item.notes ? item.notes : "No notes yet. Open the asset detail page to save a trade plan."}
          </p>
        </div>
        <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700">
          {analysis.explanation}
        </p>
        <PositioningChart data={chartData} />
      </CardBody>
    </Card>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-950">{value}</p>
    </div>
  );
}
