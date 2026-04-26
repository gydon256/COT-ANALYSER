import { DatabaseZap } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { ButtonLink } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { runCftcIngestionAction } from "@/lib/actions/admin";
import { formatDate, formatNumber } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { IngestionAssetResult, IngestionRun } from "@/lib/types";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id ?? "")
    .maybeSingle();

  const isAdmin = profile?.role === "admin";

  if (!isAdmin) {
    return (
      <>
        <PageHeader
          title="Admin"
          description="Admin tools are reserved for data ingestion and operational checks."
        />
        <StatusMessage error={params.error} message={params.message} />
        <EmptyState
          title="Admin access required"
          body="Your account is not marked as admin. Update your profile role in Supabase SQL only for trusted maintainers."
        />
      </>
    );
  }

  const [{ data: runs }, { data: assetResults }, { count: assetsCount }, { count: reportsCount }] = await Promise.all([
    supabase
      .from("ingestion_runs")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(10),
    supabase
      .from("ingestion_asset_results")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase.from("assets").select("id", { count: "exact", head: true }),
    supabase.from("cot_reports").select("id", { count: "exact", head: true })
  ]);

  const ingestionRuns = (runs ?? []) as IngestionRun[];
  const ingestionAssetResults = (assetResults ?? []) as IngestionAssetResult[];

  return (
    <>
      <PageHeader
        title="Admin"
        description="Run free public CFTC ingestion and inspect recent data refreshes."
        action={
          <ButtonLink href="/dashboard/brief" variant="secondary">
            View brief
          </ButtonLink>
        }
      />

      <StatusMessage error={params.error} message={params.message} />

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Assets tracked" value={formatNumber(assetsCount ?? 0)} />
        <StatCard label="COT reports stored" value={formatNumber(reportsCount ?? 0)} />
        <StatCard
          label="Last ingestion"
          value={ingestionRuns[0] ? ingestionRuns[0].status : "None"}
          detail={ingestionRuns[0]?.latest_report_date ? formatDate(ingestionRuns[0].latest_report_date) : undefined}
        />
      </section>

      <Card>
        <CardHeader>
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-950">
            <DatabaseZap size={20} aria-hidden="true" />
            CFTC ingestion
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Update every imported CME, COMEX, and NYMEX asset. History is capped at 126 weeks.
          </p>
        </CardHeader>
        <CardBody>
          <form action={runCftcIngestionAction} className="grid gap-4 sm:grid-cols-[220px_auto] sm:items-end">
            <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="admin-weeks">
              <span>History</span>
              <select
                className="min-h-11 rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                defaultValue="52"
                id="admin-weeks"
                name="weeks"
              >
                <option value="52">52 weeks recommended</option>
                <option value="126">126 weeks maximum</option>
              </select>
              <span className="text-xs font-normal text-slate-500">
                Use 126 weeks only when a deeper review is needed.
              </span>
            </label>
            <SubmitButton className="w-full sm:w-auto" pendingLabel="Running ingestion...">
              Update imported assets
            </SubmitButton>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-slate-950">Recent ingestion runs</h2>
        </CardHeader>
        <CardBody>
          {ingestionRuns.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
                    <th className="py-3 pr-4">Started</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-4">Assets</th>
                    <th className="py-3 pr-4">Reports</th>
                    <th className="py-3 pr-4">Latest report</th>
                    <th className="py-3 pr-4">Errors</th>
                  </tr>
                </thead>
                <tbody>
                  {ingestionRuns.map((run) => (
                    <tr key={run.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-3 pr-4 text-slate-700">
                        {new Date(run.started_at).toLocaleString()}
                      </td>
                      <td className="py-3 pr-4 font-semibold text-slate-950">{run.status}</td>
                      <td className="py-3 pr-4 text-slate-700">{run.assets_checked}</td>
                      <td className="py-3 pr-4 text-slate-700">{run.reports_upserted}</td>
                      <td className="py-3 pr-4 text-slate-700">
                        {formatDate(run.latest_report_date)}
                      </td>
                      <td className="max-w-xs truncate py-3 pr-4 text-slate-500">
                        {run.error_message ?? "None"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No ingestion runs yet"
              body="Run the first CFTC ingestion after configuring the service role key."
            />
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-slate-950">Per-asset ingestion results</h2>
          <p className="mt-1 text-sm text-slate-600">
            Recent row counts, latest report dates, skipped venues, and mapping failures.
          </p>
        </CardHeader>
        <CardBody>
          {ingestionAssetResults.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
                    <th className="py-3 pr-4">Market</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-4">Rows</th>
                    <th className="py-3 pr-4">Latest report</th>
                    <th className="py-3 pr-4">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {ingestionAssetResults.map((result) => (
                    <tr key={result.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-3 pr-4">
                        <p className="font-semibold text-slate-950">{result.symbol ?? "Market"}</p>
                        <p className="text-xs text-slate-500">{result.cftc_market_name}</p>
                      </td>
                      <td className="py-3 pr-4 font-semibold text-slate-950">{result.status}</td>
                      <td className="py-3 pr-4 text-slate-700">{formatNumber(result.rows_upserted)}</td>
                      <td className="py-3 pr-4 text-slate-700">
                        {formatDate(result.latest_report_date)}
                      </td>
                      <td className="max-w-xs truncate py-3 pr-4 text-slate-500">
                        {result.error_message ?? "None"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No per-asset results yet"
              body="Run an update or import a market from the Assets page to populate this table."
            />
          )}
        </CardBody>
      </Card>
    </>
  );
}
