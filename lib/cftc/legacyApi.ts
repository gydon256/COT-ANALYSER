import { fetchCftcJson } from "@/lib/cftc/fetchCftc";
import { parseInteger } from "@/lib/cftc/parseLegacyReport";
import type { ParsedCotReport } from "@/lib/cftc/types";

export const CFTC_LEGACY_FUTURES_ONLY_ENDPOINT =
  "https://publicreporting.cftc.gov/resource/6dca-aqww.json";

export type CftcLegacyApiRow = {
  market_and_exchange_names?: string;
  report_date_as_yyyy_mm_dd?: string;
  open_interest_all?: string;
  noncomm_positions_long_all?: string;
  noncomm_positions_short_all?: string;
  comm_positions_long_all?: string;
  comm_positions_short_all?: string;
  nonrept_positions_long_all?: string;
  nonrept_positions_short_all?: string;
};

export async function fetchLegacyReportsForMarket(options: {
  cftcMarketName: string;
  weeks?: number;
  limit?: number;
}) {
  const weeks = options.weeks ?? 260;
  const limit = options.limit ?? weeks + 12;
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - weeks * 7);
  const cutoffDate = cutoff.toISOString().slice(0, 10);

  const params = new URLSearchParams({
    "$where": `market_and_exchange_names=${soqlString(options.cftcMarketName)} AND report_date_as_yyyy_mm_dd >= ${soqlString(cutoffDate)}`,
    "$order": "report_date_as_yyyy_mm_dd ASC",
    "$limit": String(limit)
  });

  return fetchCftcJson<CftcLegacyApiRow[]>(`${CFTC_LEGACY_FUTURES_ONLY_ENDPOINT}?${params}`);
}

export function mapLegacyRowToReport(assetId: number, row: CftcLegacyApiRow): ParsedCotReport | null {
  const reportDate = row.report_date_as_yyyy_mm_dd?.slice(0, 10);
  const nonCommercialLong = parseInteger(row.noncomm_positions_long_all);
  const nonCommercialShort = parseInteger(row.noncomm_positions_short_all);

  if (!reportDate || nonCommercialLong == null || nonCommercialShort == null) {
    return null;
  }

  const commercialLong = parseInteger(row.comm_positions_long_all);
  const commercialShort = parseInteger(row.comm_positions_short_all);
  const nonReportableLong = parseInteger(row.nonrept_positions_long_all);
  const nonReportableShort = parseInteger(row.nonrept_positions_short_all);

  return {
    asset_id: assetId,
    report_date: reportDate,
    open_interest: parseInteger(row.open_interest_all),
    non_commercial_long: nonCommercialLong,
    non_commercial_short: nonCommercialShort,
    non_commercial_net: nonCommercialLong - nonCommercialShort,
    commercial_long: commercialLong,
    commercial_short: commercialShort,
    commercial_net:
      commercialLong != null && commercialShort != null ? commercialLong - commercialShort : null,
    non_reportable_long: nonReportableLong,
    non_reportable_short: nonReportableShort,
    non_reportable_net:
      nonReportableLong != null && nonReportableShort != null
        ? nonReportableLong - nonReportableShort
        : null
  };
}

function soqlString(value: string) {
  return `'${value.replaceAll("'", "''")}'`;
}
