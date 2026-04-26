import {
  fetchAllowedMarketHistory,
  marketAliasRows,
  type AllowedCftcMarket,
  type AllowedFetchWeeks
} from "@/lib/cftc/allowedMarkets";
import { getErrorMessage } from "@/lib/errors";
import { createServiceRoleClient } from "@/lib/supabase/server";

export type FetchedMarketResult = {
  assetId: number;
  symbol: string;
  cftcMarketName: string;
  reportsUpserted: number;
  latestReportDate: string | null;
};

export async function fetchAndUpsertAllowedMarket(options: {
  market: AllowedCftcMarket;
  weeks: AllowedFetchWeeks;
  createdBy?: string | null;
  source?: string;
  createRun?: boolean;
}): Promise<FetchedMarketResult> {
  const supabase = createServiceRoleClient();
  const startedAt = new Date().toISOString();
  let runId: number | null = null;

  if (options.createRun) {
    const { data: run } = await supabase
      .from("ingestion_runs")
      .insert({
        started_at: startedAt,
        source: options.source ?? "user_live_fetch",
        status: "running",
        created_by: options.createdBy ?? null
      })
      .select("id")
      .maybeSingle();

    runId = run?.id ?? null;
  }

  try {
    const result = await upsertAllowedMarketData(options.market, options.weeks, runId);

    if (runId) {
      await supabase
        .from("ingestion_runs")
        .update({
          finished_at: new Date().toISOString(),
          status: "success",
          assets_checked: 1,
          reports_upserted: result.reportsUpserted,
          latest_report_date: result.latestReportDate
        })
        .eq("id", runId);
    }

    return result;
  } catch (error) {
    const message = getErrorMessage(error, "CFTC fetch failed.");

    if (runId) {
      try {
        await supabase
          .from("ingestion_asset_results")
          .insert({
            run_id: runId,
            symbol: options.market.symbol,
            cftc_market_name: options.market.cftcMarketName,
            status: "failed",
            error_message: message
          });

        await supabase
          .from("ingestion_runs")
          .update({
            finished_at: new Date().toISOString(),
            status: "failed",
            error_message: message
          })
          .eq("id", runId);
      } catch (resultError) {
        console.error("Failed to record CFTC ingestion failure", {
          runId,
          message: getErrorMessage(resultError)
        });
      }
    }

    throw new Error(message);
  }
}

export async function upsertAllowedMarketData(
  market: AllowedCftcMarket,
  weeks: AllowedFetchWeeks,
  runId?: number | null
): Promise<FetchedMarketResult> {
  const supabase = createServiceRoleClient();
  const { data: asset, error: assetError } = await supabase
    .from("assets")
    .upsert(
      {
        symbol: market.symbol,
        display_name: market.displayName,
        cftc_market_name: market.cftcMarketName,
        exchange: market.exchange,
        category: market.category
      },
      { onConflict: "symbol" }
    )
    .select("id, symbol")
    .single();

  if (assetError) {
    throw assetError;
  }

  const reports = await fetchAllowedMarketHistory({
    cftcMarketName: market.cftcMarketName,
    assetId: asset.id,
    weeks
  });

  if (!reports.length) {
    throw new Error("No valid non-commercial CFTC rows were returned for this market.");
  }

  const { error: reportsError } = await supabase.from("cot_reports").upsert(reports, {
    onConflict: "asset_id,report_date"
  });

  if (reportsError) {
    throw reportsError;
  }

  const aliases = marketAliasRows(asset.id, market);
  if (aliases.length) {
    const { error: aliasesError } = await supabase.from("asset_aliases").upsert(aliases, {
      onConflict: "asset_id,normalized_alias"
    });

    if (aliasesError) {
      throw aliasesError;
    }
  }

  const latestReportDate = reports.at(-1)?.report_date ?? null;

  if (runId) {
    const { error: resultError } = await supabase.from("ingestion_asset_results").insert({
      run_id: runId,
      asset_id: asset.id,
      symbol: asset.symbol,
      cftc_market_name: market.cftcMarketName,
      status: "success",
      rows_upserted: reports.length,
      latest_report_date: latestReportDate
    });

    if (resultError) {
      throw resultError;
    }
  }

  return {
    assetId: asset.id,
    symbol: asset.symbol,
    cftcMarketName: market.cftcMarketName,
    reportsUpserted: reports.length,
    latestReportDate
  };
}
