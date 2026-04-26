import { analyzeAssets, type CotAnalysis } from "@/lib/cot/analytics";
import { formatCompactNumber, formatDate } from "@/lib/format";
import type { Asset, CotReport } from "@/lib/types";

export type MarketOverviewRow = {
  analysis: CotAnalysis;
  asset: Asset;
  latestReportDate: string | null;
};

export function buildMarketOverviewRows(assets: Asset[], reports: CotReport[]) {
  const reportsByAsset = new Map<number, CotReport[]>();

  for (const report of reports) {
    const current = reportsByAsset.get(report.asset_id) ?? [];
    current.push(report);
    reportsByAsset.set(report.asset_id, current);
  }

  return analyzeAssets(assets, reportsByAsset)
    .filter((analysis) => analysis.latest)
    .sort((a, b) => b.rank - a.rank)
    .map((analysis) => ({
      analysis,
      asset: analysis.asset,
      latestReportDate: analysis.latest?.reportDate ?? null
    }));
}

export function marketOverviewToCsv(rows: MarketOverviewRow[]) {
  const headers = [
    "Symbol",
    "Display Name",
    "CFTC Market Name",
    "Category",
    "Report Date",
    "Freshness",
    "Adjusted Net",
    "Weekly Change",
    "Commercial Net",
    "Open Interest",
    "COT Index 26",
    "COT Index 52",
    "COT Index 156",
    "Percentile",
    "Score",
    "Signal",
    "Signal Explanation"
  ];
  const lines = [headers.map(csvEscape).join(",")];

  for (const row of rows) {
    const { analysis, asset } = row;
    lines.push(
      [
        asset.symbol,
        asset.display_name,
        asset.cftc_market_name,
        asset.category ?? "",
        formatDate(analysis.latest?.reportDate),
        analysis.freshness.label,
        formatCompactNumber(analysis.latest?.adjustedNet),
        formatCompactNumber(analysis.latest?.adjustedChange),
        formatCompactNumber(analysis.latest?.commercialNet),
        formatCompactNumber(analysis.latest?.openInterest),
        analysis.cotIndex26 == null ? "" : Math.round(analysis.cotIndex26),
        analysis.cotIndex52 == null ? "" : Math.round(analysis.cotIndex52),
        analysis.cotIndex156 == null ? "" : Math.round(analysis.cotIndex156),
        analysis.percentile == null ? "" : Math.round(analysis.percentile),
        analysis.score,
        analysis.signal,
        analysis.explanation
      ]
        .map(csvEscape)
        .join(",")
    );
  }

  return lines.join("\n");
}

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}
