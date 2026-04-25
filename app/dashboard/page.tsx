import { BarChart3 } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { ButtonLink } from "@/components/ui/Button";
import { describeNetBias, formatCompactNumber, formatDate, formatNumber } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Asset, CotReport } from "@/lib/types";

export const dynamic = "force-dynamic";

type OverviewRow = Pick<
  CotReport,
  "asset_id" | "report_date" | "open_interest" | "non_commercial_net" | "commercial_net"
> & {
  assets: Pick<Asset, "symbol" | "display_name" | "category"> | null;
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const [assetsResult, watchlistsResult, latestReportResult, overviewResult] = await Promise.all([
    supabase.from("assets").select("id", { count: "exact", head: true }),
    supabase
      .from("watchlists")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user?.id ?? ""),
    supabase
      .from("cot_reports")
      .select("report_date")
      .order("report_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("cot_reports")
      .select(
        "asset_id, report_date, open_interest, non_commercial_net, commercial_net, assets(symbol, display_name, category)"
      )
      .order("report_date", { ascending: false })
      .limit(80)
  ]);

  const latestByAsset = new Map<number, OverviewRow>();
  const overviewRows = (overviewResult.data ?? []) as unknown as OverviewRow[];

  for (const row of overviewRows) {
    if (!latestByAsset.has(row.asset_id)) {
      latestByAsset.set(row.asset_id, row);
    }
  }

  const latestRows = Array.from(latestByAsset.values()).slice(0, 8);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="A compact view of your available COT markets, saved watchlists, and latest positioning reports."
        action={
          <ButtonLink href="/dashboard/assets" variant="secondary">
            <BarChart3 size={16} aria-hidden="true" />
            Browse assets
          </ButtonLink>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          detail="Seeded markets ready for search and watchlists"
          label="Available assets"
          value={formatNumber(assetsResult.count ?? 0)}
        />
        <StatCard
          detail="Private lists protected by Supabase RLS"
          label="Your watchlists"
          value={formatNumber(watchlistsResult.count ?? 0)}
        />
        <StatCard
          detail="Most recent seeded COT report"
          label="Latest report"
          value={formatDate(latestReportResult.data?.report_date)}
        />
      </section>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-slate-950">Market Positioning Overview</h2>
          <p className="mt-1 text-sm text-slate-600">
            Latest non-commercial and commercial net positioning by market.
          </p>
        </CardHeader>
        <CardBody>
          {latestRows.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
                    <th className="py-3 pr-4">Asset</th>
                    <th className="py-3 pr-4">Category</th>
                    <th className="py-3 pr-4">Report date</th>
                    <th className="py-3 pr-4">Open interest</th>
                    <th className="py-3 pr-4">Non-commercial net</th>
                    <th className="py-3 pr-4">Commercial net</th>
                    <th className="py-3 pr-4">Bias</th>
                  </tr>
                </thead>
                <tbody>
                  {latestRows.map((row) => (
                    <tr key={row.asset_id} className="border-b border-slate-100 last:border-0">
                      <td className="py-3 pr-4">
                        <p className="font-bold text-slate-950">{row.assets?.symbol ?? "Asset"}</p>
                        <p className="text-xs text-slate-500">{row.assets?.display_name}</p>
                      </td>
                      <td className="py-3 pr-4 text-slate-700">{row.assets?.category ?? "n/a"}</td>
                      <td className="py-3 pr-4 text-slate-700">{formatDate(row.report_date)}</td>
                      <td className="py-3 pr-4 text-slate-700">
                        {formatCompactNumber(row.open_interest)}
                      </td>
                      <td className="py-3 pr-4 font-semibold text-teal-800">
                        {formatCompactNumber(row.non_commercial_net)}
                      </td>
                      <td className="py-3 pr-4 font-semibold text-red-700">
                        {formatCompactNumber(row.commercial_net)}
                      </td>
                      <td className="py-3 pr-4 text-slate-700">
                        {describeNetBias(row.non_commercial_net)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No report data yet"
              body="Run the seed migration to load sample COT reports for the MVP dashboard."
            />
          )}
        </CardBody>
      </Card>
    </>
  );
}
