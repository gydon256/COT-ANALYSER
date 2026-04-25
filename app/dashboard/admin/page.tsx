import { DatabaseZap } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { ButtonLink } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { FormField } from "@/components/ui/FormField";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { runCftcIngestionAction } from "@/lib/actions/admin";
import { formatDate, formatNumber } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { IngestionRun } from "@/lib/types";

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

  const [{ data: runs }, { count: assetsCount }, { count: reportsCount }] = await Promise.all([
    supabase
      .from("ingestion_runs")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(10),
    supabase.from("assets").select("id", { count: "exact", head: true }),
    supabase.from("cot_reports").select("id", { count: "exact", head: true })
  ]);

  const ingestionRuns = (runs ?? []) as IngestionRun[];

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
            Pull Legacy Futures Only rows from CFTC Public Reporting for every mapped asset.
          </p>
        </CardHeader>
        <CardBody>
          <form action={runCftcIngestionAction} className="grid gap-4 sm:grid-cols-[220px_auto] sm:items-end">
            <FormField
              defaultValue="260"
              hint="260 weeks is about 5 years. Max 1040."
              label="History weeks"
              max={1040}
              min={4}
              name="weeks"
              required
              type="number"
            />
            <SubmitButton className="w-full sm:w-auto" pendingLabel="Running ingestion...">
              Run CFTC ingestion
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
    </>
  );
}
