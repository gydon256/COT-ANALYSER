import Link from "next/link";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SignalPill } from "@/components/dashboard/SignalPill";
import { StatCard } from "@/components/dashboard/StatCard";
import { ButtonLink } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { analyzeAssets, type CotAnalysis } from "@/lib/cot/analytics";
import { formatCompactNumber, formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Asset, CotReport } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function BriefPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const [{ data: assetsData }, { data: reportsData }, { data: watchlists }] = await Promise.all([
    supabase.from("assets").select("*").order("symbol", { ascending: true }),
    supabase.from("cot_reports").select("*").order("report_date", { ascending: true }),
    supabase.from("watchlists").select("id").eq("user_id", user?.id ?? "")
  ]);

  const assets = (assetsData ?? []) as Asset[];
  const reportsByAsset = new Map<number, CotReport[]>();

  for (const report of (reportsData ?? []) as CotReport[]) {
    const current = reportsByAsset.get(report.asset_id) ?? [];
    current.push(report);
    reportsByAsset.set(report.asset_id, current);
  }

  const analyses = analyzeAssets(assets, reportsByAsset).filter((analysis) => analysis.latest);
  const ranked = [...analyses].sort((a, b) => b.rank - a.rank);
  const biggestShifts = [...analyses].sort(
    (a, b) => Math.abs(b.latest?.adjustedChange ?? 0) - Math.abs(a.latest?.adjustedChange ?? 0)
  );
  const extremes = [...analyses]
    .filter((analysis) => analysis.cotIndex52 != null && (analysis.cotIndex52 >= 80 || analysis.cotIndex52 <= 20))
    .sort((a, b) => Math.abs((b.cotIndex52 ?? 50) - 50) - Math.abs((a.cotIndex52 ?? 50) - 50));

  const watchlistIds = (watchlists ?? []).map((watchlist) => watchlist.id);
  const savedAssetIds = new Set<number>();

  if (watchlistIds.length) {
    const { data: items } = await supabase
      .from("watchlist_items")
      .select("asset_id")
      .in("watchlist_id", watchlistIds);

    for (const item of items ?? []) {
      savedAssetIds.add(item.asset_id);
    }
  }

  const watchlistPriorities = ranked.filter((analysis) => savedAssetIds.has(analysis.asset.id));
  const latestReportDate = analyses
    .map((analysis) => analysis.latest?.reportDate)
    .filter((date): date is string => Boolean(date))
    .sort()
    .at(-1);

  return (
    <>
      <PageHeader
        title="Weekly COT Brief"
        description="A focused weekly review of strongest positioning signals, crowded extremes, and watchlist priorities."
        action={<ButtonLink href="/dashboard/admin" variant="secondary">Refresh CFTC data</ButtonLink>}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Markets reviewed" value={analyses.length} />
        <StatCard label="Latest report" value={formatDate(latestReportDate)} />
        <StatCard label="Crowded extremes" value={extremes.length} />
      </section>

      {!analyses.length ? (
        <EmptyState
          action={<ButtonLink href="/dashboard/admin">Run ingestion</ButtonLink>}
          title="No COT reports available"
          body="Run CFTC ingestion or seed data before generating a weekly brief."
        />
      ) : (
        <section className="grid gap-5 xl:grid-cols-2">
          <BriefPanel
            title="Highest Priority Signals"
            description="Ranked by score, extremes, reversal/trend mode, and data freshness."
            rows={ranked.slice(0, 8)}
          />
          <BriefPanel
            title="Watchlist Priorities"
            description="Your saved markets sorted by the same signal engine."
            rows={watchlistPriorities.slice(0, 8)}
            emptyTitle="No watchlist assets"
            emptyBody="Save assets to your watchlist and they will be ranked here."
          />
          <BriefPanel
            title="Crowded Extremes"
            description="Markets near the top or bottom of their 52-week positioning range."
            rows={extremes.slice(0, 8)}
            emptyTitle="No 52-week extremes"
            emptyBody="No markets are currently above 80 or below 20 on the 52-week COT Index."
          />
          <BriefPanel
            title="Biggest Weekly Shifts"
            description="Largest adjusted non-commercial net position changes this week."
            rows={biggestShifts.slice(0, 8)}
          />
        </section>
      )}

      <Card>
        <CardBody>
          <p className="text-sm leading-6 text-slate-600">
            COT data is weekly and lagged. This brief is a positioning filter, not a trade entry
            system. Use it with your price model, level, trigger, stop, target, and risk plan.
          </p>
        </CardBody>
      </Card>
    </>
  );
}

function BriefPanel({
  title,
  description,
  rows,
  emptyTitle = "No rows",
  emptyBody = "No matching markets are available."
}: {
  title: string;
  description: string;
  rows: CotAnalysis[];
  emptyTitle?: string;
  emptyBody?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-bold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </CardHeader>
      <CardBody>
        {rows.length ? (
          <div className="grid gap-3">
            {rows.map((analysis) => (
              <Link
                key={analysis.asset.id}
                className="grid gap-3 rounded-md border border-slate-200 p-3 transition hover:border-teal-300 hover:bg-teal-50/40"
                href={`/dashboard/assets/${encodeURIComponent(analysis.asset.symbol)}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-950">{analysis.asset.symbol}</p>
                    <p className="mt-1 text-xs text-slate-500">{analysis.asset.display_name}</p>
                  </div>
                  <SignalPill signal={analysis.signal} title={analysis.explanation} />
                </div>
                <div className="grid gap-2 text-xs text-slate-600 sm:grid-cols-3">
                  <span>Adjusted net: {formatCompactNumber(analysis.latest?.adjustedNet)}</span>
                  <span>Change: {formatCompactNumber(analysis.latest?.adjustedChange)}</span>
                  <span>
                    52w index:{" "}
                    {analysis.cotIndex52 == null ? "n/a" : `${Math.round(analysis.cotIndex52)}/100`}
                  </span>
                </div>
                <p className="text-sm leading-6 text-slate-700">{analysis.explanation}</p>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState title={emptyTitle} body={emptyBody} />
        )}
      </CardBody>
    </Card>
  );
}
