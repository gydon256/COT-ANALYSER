import { BarChart3, Download } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SignalPill } from "@/components/dashboard/SignalPill";
import { StatCard } from "@/components/dashboard/StatCard";
import { ButtonLink } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { buildMarketOverviewRows } from "@/lib/cot/marketOverview";
import { formatCompactNumber, formatDate, formatNumber } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Asset, CotReport } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const [{ data: assetsData }, { data: reportsData }, { count: watchlistCount }] = await Promise.all([
    supabase.from("assets").select("*").order("symbol", { ascending: true }),
    supabase.from("cot_reports").select("*").order("report_date", { ascending: true }),
    supabase
      .from("watchlists")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user?.id ?? "")
  ]);

  const assets = (assetsData ?? []) as Asset[];
  const reports = (reportsData ?? []) as CotReport[];
  const rows = buildMarketOverviewRows(assets, reports);
  const latestReportDate = rows
    .map((row) => row.latestReportDate)
    .filter((date): date is string => Boolean(date))
    .sort()
    .at(-1);
  const staleCount = rows.filter((row) => row.analysis.freshness.label === "Stale").length;
  const topSignals = rows.slice(0, 5);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Ranked COT signals, freshness, and market positioning for imported CFTC markets."
        action={
          <div className="flex flex-wrap gap-2">
            <ButtonLink href="/dashboard/export" variant="secondary">
              <Download size={16} aria-hidden="true" />
              Export CSV
            </ButtonLink>
            <ButtonLink href="/dashboard/assets" variant="secondary">
              <BarChart3 size={16} aria-hidden="true" />
              Import asset
            </ButtonLink>
          </div>
        }
      />

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard detail="Imported markets" label="Assets" value={formatNumber(assets.length)} />
        <StatCard detail="Private lists protected by RLS" label="Watchlists" value={formatNumber(watchlistCount ?? 0)} />
        <StatCard detail="Latest stored CFTC row" label="Latest report" value={formatDate(latestReportDate)} />
        <StatCard detail="Refresh before relying on stale rows" label="Stale markets" value={formatNumber(staleCount)} />
      </section>

      {rows.length ? (
        <>
          <section className="grid gap-4 xl:grid-cols-5">
            {topSignals.map((row) => (
              <Link
                key={row.asset.id}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-teal-300 hover:bg-teal-50/40"
                href={`/dashboard/assets/${encodeURIComponent(row.asset.symbol)}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-950">{row.asset.symbol}</p>
                    <p className="mt-1 text-xs text-slate-500">{row.asset.category ?? "Market"}</p>
                  </div>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
                    {row.analysis.score > 0 ? "+" : ""}
                    {row.analysis.score}
                  </span>
                </div>
                <div className="mt-3">
                  <SignalPill signal={row.analysis.signal} title={row.analysis.explanation} />
                </div>
                <p className="mt-3 text-xs leading-5 text-slate-600">
                  52w index:{" "}
                  {row.analysis.cotIndex52 == null ? "n/a" : `${Math.round(row.analysis.cotIndex52)}/100`}
                </p>
              </Link>
            ))}
          </section>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold text-slate-950">Market overview</h2>
              <p className="mt-1 text-sm text-slate-600">
                Ranked by signal strength, COT extremes, mode, and freshness.
              </p>
            </CardHeader>
            <CardBody>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
                      <th className="py-3 pr-4">Asset</th>
                      <th className="py-3 pr-4">Signal</th>
                      <th className="py-3 pr-4">Score</th>
                      <th className="py-3 pr-4">Report</th>
                      <th className="py-3 pr-4">Freshness</th>
                      <th className="py-3 pr-4">Adjusted net</th>
                      <th className="py-3 pr-4">Weekly change</th>
                      <th className="py-3 pr-4">52w index</th>
                      <th className="py-3 pr-4">Mode</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.asset.id} className="border-b border-slate-100 last:border-0">
                        <td className="py-3 pr-4">
                          <Link
                            className="font-bold text-slate-950 hover:text-teal-800"
                            href={`/dashboard/assets/${encodeURIComponent(row.asset.symbol)}`}
                          >
                            {row.asset.symbol}
                          </Link>
                          <p className="text-xs text-slate-500">{row.asset.display_name}</p>
                        </td>
                        <td className="py-3 pr-4">
                          <SignalPill signal={row.analysis.signal} title={row.analysis.explanation} />
                        </td>
                        <td className="py-3 pr-4 font-semibold text-slate-950">
                          {row.analysis.score > 0 ? "+" : ""}
                          {row.analysis.score}
                        </td>
                        <td className="py-3 pr-4 text-slate-700">{formatDate(row.latestReportDate)}</td>
                        <td className="py-3 pr-4 text-slate-700">{row.analysis.freshness.label}</td>
                        <td className="py-3 pr-4 font-semibold text-teal-800">
                          {formatCompactNumber(row.analysis.latest?.adjustedNet)}
                        </td>
                        <td className="py-3 pr-4 text-slate-700">
                          {formatCompactNumber(row.analysis.latest?.adjustedChange)}
                        </td>
                        <td className="py-3 pr-4 text-slate-700">
                          {row.analysis.cotIndex52 == null ? "n/a" : `${Math.round(row.analysis.cotIndex52)}/100`}
                        </td>
                        <td className="py-3 pr-4 text-slate-700">{row.analysis.mode.label}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </>
      ) : (
        <EmptyState
          action={<ButtonLink href="/dashboard/assets">Search CFTC markets</ButtonLink>}
          title="No imported COT history yet"
          body="Search for a CME, COMEX, or NYMEX market, fetch 52 weeks, and save it to your watchlist."
        />
      )}
    </>
  );
}
