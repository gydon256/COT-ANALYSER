import { fetchLegacyReportsForMarket, mapLegacyRowToReport } from "@/lib/cftc/legacyApi";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { Asset } from "@/lib/types";

export type CftcIngestionResult = {
  assetsChecked: number;
  reportsUpserted: number;
  latestReportDate: string | null;
  errors: string[];
};

export async function ingestKnownCftcAssets(options: {
  weeks?: number;
  createdBy?: string;
  assetIds?: number[];
} = {}): Promise<CftcIngestionResult> {
  const supabase = createServiceRoleClient();
  const startedAt = new Date().toISOString();
  const { data: run } = await supabase
    .from("ingestion_runs")
    .insert({
      started_at: startedAt,
      status: "running",
      created_by: options.createdBy ?? null
    })
    .select("id")
    .maybeSingle();

  const runId = run?.id;
  const errors: string[] = [];
  let reportsUpserted = 0;
  let latestReportDate: string | null = null;

  try {
    let assetsQuery = supabase.from("assets").select("*").order("symbol", { ascending: true });

    if (options.assetIds?.length) {
      assetsQuery = assetsQuery.in("id", options.assetIds);
    }

    const { data: assets, error: assetsError } = await assetsQuery;

    if (assetsError) {
      throw assetsError;
    }

    for (const asset of (assets ?? []) as Asset[]) {
      try {
        const rows = await fetchLegacyReportsForMarket({
          cftcMarketName: asset.cftc_market_name,
          weeks: options.weeks ?? 260
        });
        const reports = rows
          .map((row) => mapLegacyRowToReport(asset.id, row))
          .filter((report) => report != null);

        if (reports.length) {
          const { error: upsertError } = await supabase.from("cot_reports").upsert(reports, {
            onConflict: "asset_id,report_date"
          });

          if (upsertError) {
            throw upsertError;
          }

          reportsUpserted += reports.length;
          const assetLatest = reports.at(-1)?.report_date ?? null;

          if (assetLatest && (!latestReportDate || assetLatest > latestReportDate)) {
            latestReportDate = assetLatest;
          }
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown CFTC ingestion error.";
        errors.push(`${asset.symbol}: ${message}`);
      }

      await sleep(150);
    }

    if (runId) {
      await supabase
        .from("ingestion_runs")
        .update({
          finished_at: new Date().toISOString(),
          status: errors.length ? "partial" : "success",
          assets_checked: assets?.length ?? 0,
          reports_upserted: reportsUpserted,
          latest_report_date: latestReportDate,
          error_message: errors.join("\n").slice(0, 4000) || null
        })
        .eq("id", runId);
    }

    return {
      assetsChecked: assets?.length ?? 0,
      reportsUpserted,
      latestReportDate,
      errors
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown CFTC ingestion failure.";

    if (runId) {
      await supabase
        .from("ingestion_runs")
        .update({
          finished_at: new Date().toISOString(),
          status: "failed",
          error_message: message
        })
        .eq("id", runId);
    }

    throw error;
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
