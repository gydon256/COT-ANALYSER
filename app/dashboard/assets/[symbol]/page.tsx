import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Star } from "lucide-react";
import { CotIndexChart } from "@/components/charts/CotIndexChart";
import { PositioningChart } from "@/components/charts/PositioningChart";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SignalPill } from "@/components/dashboard/SignalPill";
import { StatCard } from "@/components/dashboard/StatCard";
import { ButtonLink } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { saveAssetToWatchlistAction } from "@/lib/actions/watchlists";
import { analyzeCot } from "@/lib/cot/analytics";
import { formatCompactNumber, formatDate, formatNumber } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Asset, CotReport } from "@/lib/types";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ symbol: string }>;
};

export default async function AssetDetailPage({ params }: PageProps) {
  const { symbol } = await params;
  const supabase = await createClient();
  const normalizedSymbol = decodeURIComponent(symbol).toUpperCase();

  const { data: assetData } = await supabase
    .from("assets")
    .select("*")
    .eq("symbol", normalizedSymbol)
    .maybeSingle();

  if (!assetData) {
    notFound();
  }

  const asset = assetData as Asset;
  const [{ data: reportsData }, { data: watchlists }] = await Promise.all([
    supabase
      .from("cot_reports")
      .select("*")
      .eq("asset_id", asset.id)
      .order("report_date", { ascending: true }),
    supabase.from("watchlists").select("id")
  ]);

  const watchlistIds = (watchlists ?? []).map((watchlist) => watchlist.id);
  let saved = false;

  if (watchlistIds.length) {
    const { data: item } = await supabase
      .from("watchlist_items")
      .select("id")
      .eq("asset_id", asset.id)
      .in("watchlist_id", watchlistIds)
      .maybeSingle();
    saved = Boolean(item);
  }

  const reports = (reportsData ?? []) as CotReport[];
  const analysis = analyzeCot(asset, reports);
  const latest = analysis.latest;
  const latestReport = reports.at(-1);

  return (
    <>
      <PageHeader
        title={`${asset.symbol} ${asset.display_name}`}
        description={asset.cftc_market_name}
        action={
          <ButtonLink href="/dashboard/assets" variant="secondary">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to assets
          </ButtonLink>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <SignalPill signal={analysis.signal} title={analysis.explanation} />
        <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
          {analysis.freshness.label}
          {analysis.freshness.daysOld != null ? ` · ${analysis.freshness.daysOld}d old` : ""}
        </span>
        <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
          {analysis.meta.view}
        </span>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Adjusted net"
          value={formatCompactNumber(latest?.adjustedNet)}
          detail={`Raw non-commercial net ${formatCompactNumber(latestReport?.non_commercial_net)}`}
        />
        <StatCard
          label="Weekly change"
          value={formatCompactNumber(latest?.adjustedChange)}
          detail={analysis.mode.label}
        />
        <StatCard
          label="52w COT Index"
          value={analysis.cotIndex52 == null ? "n/a" : `${Math.round(analysis.cotIndex52)}/100`}
          detail="80+ crowded long, 20- crowded short"
        />
        <StatCard
          label="Open interest"
          value={formatCompactNumber(latest?.openInterest)}
          detail={`Latest report ${formatDate(latest?.reportDate)}`}
        />
      </section>

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Signal interpretation</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">{analysis.explanation}</p>
          </div>
          <form action={saveAssetToWatchlistAction}>
            <input name="assetId" type="hidden" value={asset.id} />
            <input name="returnTo" type="hidden" value={`/dashboard/assets/${asset.symbol}`} />
            <SubmitButton pendingLabel="Saving..." variant={saved ? "secondary" : "primary"}>
              {saved ? "Saved" : "Save to Watchlist"}
            </SubmitButton>
          </form>
        </CardHeader>
      </Card>

      <section className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-bold text-slate-950">Positioning Trend</h2>
            <p className="mt-1 text-sm text-slate-600">
              Non-commercial net, commercial net, and open interest over time.
            </p>
          </CardHeader>
          <CardBody>
            <PositioningChart
              data={reports.map((report) => ({
                reportDate: report.report_date,
                nonCommercialNet: report.non_commercial_net,
                commercialNet: report.commercial_net,
                openInterest: report.open_interest
              }))}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-bold text-slate-950">COT Index</h2>
            <p className="mt-1 text-sm text-slate-600">
              Positioning location inside recent historical ranges.
            </p>
          </CardHeader>
          <CardBody>
            <CotIndexChart
              data={analysis.points.map((point) => ({
                reportDate: point.reportDate,
                cotIndex13: point.cotIndex13,
                cotIndex26: point.cotIndex26,
                cotIndex52: point.cotIndex52
              }))}
            />
          </CardBody>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-slate-950">Latest COT report</h2>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
                  <th className="py-3 pr-4">Report date</th>
                  <th className="py-3 pr-4">Open interest</th>
                  <th className="py-3 pr-4">Non-commercial long</th>
                  <th className="py-3 pr-4">Non-commercial short</th>
                  <th className="py-3 pr-4">Non-commercial net</th>
                  <th className="py-3 pr-4">Commercial net</th>
                </tr>
              </thead>
              <tbody>
                {reports
                  .slice(-12)
                  .reverse()
                  .map((report) => (
                    <tr key={report.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-3 pr-4 text-slate-700">{formatDate(report.report_date)}</td>
                      <td className="py-3 pr-4 text-slate-700">{formatNumber(report.open_interest)}</td>
                      <td className="py-3 pr-4 text-slate-700">
                        {formatNumber(report.non_commercial_long)}
                      </td>
                      <td className="py-3 pr-4 text-slate-700">
                        {formatNumber(report.non_commercial_short)}
                      </td>
                      <td className="py-3 pr-4 font-semibold text-teal-800">
                        {formatNumber(report.non_commercial_net)}
                      </td>
                      <td className="py-3 pr-4 font-semibold text-red-700">
                        {formatNumber(report.commercial_net)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-500">
            COT is a weekly positioning filter, not a standalone trade signal. Combine it with your
            price model, level, trigger, stop, target, and risk plan.
          </p>
        </CardBody>
      </Card>

      <Link className="text-sm font-semibold text-teal-800 hover:text-teal-900" href="/dashboard/brief">
        Review this market inside the weekly brief
      </Link>
    </>
  );
}
