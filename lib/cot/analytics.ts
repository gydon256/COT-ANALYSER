import type { Asset, CotReport } from "@/lib/types";
import { resolveMarketMeta, type MarketMeta } from "@/lib/cot/marketMeta";

export type CotSignal =
  | "Crowded Long"
  | "Crowded Short"
  | "Crowded Long Weakening"
  | "Crowded Short Unwinding"
  | "Bullish Weekly Shift"
  | "Bearish Weekly Shift"
  | "Neutral"
  | "Not Enough History";

export type CotModeGroup = "trend" | "reversal" | "neutral";
export type CotTradeBias = "long" | "short" | "neutral";

export type CotPoint = {
  reportDate: string;
  openInterest: number | null;
  nonCommercialNet: number;
  commercialNet: number;
  adjustedNet: number;
  adjustedChange: number;
  cotIndex13: number | null;
  cotIndex26: number | null;
  cotIndex52: number | null;
  cotIndex156: number | null;
};

export type CotAnalysis = {
  asset: Asset;
  meta: MarketMeta;
  points: CotPoint[];
  latest: CotPoint | null;
  previous: CotPoint | null;
  percentile: number | null;
  cotIndex13: number | null;
  cotIndex26: number | null;
  cotIndex52: number | null;
  cotIndex156: number | null;
  signal: CotSignal;
  explanation: string;
  score: number;
  rank: number;
  mode: {
    group: CotModeGroup;
    label: string;
    tradeBias: CotTradeBias;
  };
  freshness: {
    label: "Fresh" | "Check Update" | "Stale" | "Unknown";
    daysOld: number | null;
  };
};

export function analyzeCot(asset: Asset, reports: CotReport[]): CotAnalysis {
  const meta = resolveMarketMeta(asset);
  const sortedReports = [...reports].sort((a, b) => a.report_date.localeCompare(b.report_date));
  const rawPoints = sortedReports
    .map((report, index) => {
      const nonCommercialNet = report.non_commercial_net ?? 0;
      const commercialNet = report.commercial_net ?? 0;
      const previous = sortedReports[index - 1];
      const previousNet = previous?.non_commercial_net ?? nonCommercialNet;
      const adjustedNet = nonCommercialNet * meta.multiplier;
      const adjustedPreviousNet = previousNet * meta.multiplier;

      return {
        reportDate: report.report_date,
        openInterest: report.open_interest,
        nonCommercialNet,
        commercialNet,
        adjustedNet,
        adjustedChange: index === 0 ? 0 : adjustedNet - adjustedPreviousNet
      };
    })
    .filter((point) => point.reportDate);

  const points: CotPoint[] = rawPoints.map((point, index) => ({
    ...point,
    cotIndex13: cotIndexAt(rawPoints, index, 13),
    cotIndex26: cotIndexAt(rawPoints, index, 26),
    cotIndex52: cotIndexAt(rawPoints, index, 52),
    cotIndex156: cotIndexAt(rawPoints, index, 156)
  }));

  const latest = points.at(-1) ?? null;
  const previous = points.at(-2) ?? null;
  const percentile = latest ? percentileForValue(points.map((point) => point.adjustedNet), latest.adjustedNet) : null;
  const cotIndex13 = latest?.cotIndex13 ?? null;
  const cotIndex26 = latest?.cotIndex26 ?? null;
  const cotIndex52 = latest?.cotIndex52 ?? null;
  const cotIndex156 = latest?.cotIndex156 ?? null;
  const score = latest ? buildScore(points, cotIndex52) : 0;
  const mode = classifyMode(score, cotIndex52, latest?.adjustedChange ?? 0);
  const signal = buildSignal(points, percentile);
  const freshness = latest ? getFreshness(latest.reportDate) : { label: "Unknown" as const, daysOld: null };
  const rank =
    Math.abs(score) +
    (cotIndex52 != null && (cotIndex52 >= 80 || cotIndex52 <= 20) ? 18 : 0) +
    (mode.group === "reversal" ? 16 : 0) +
    (mode.group === "trend" ? 10 : 0) +
    (freshness.label === "Fresh" ? 4 : 0);

  return {
    asset,
    meta,
    points,
    latest,
    previous,
    percentile,
    cotIndex13,
    cotIndex26,
    cotIndex52,
    cotIndex156,
    signal,
    explanation: signalExplanation(signal, asset.symbol, percentile),
    score,
    rank,
    mode,
    freshness
  };
}

export function analyzeAssets(
  assets: Asset[],
  reportsByAsset: Map<number, CotReport[]>
) {
  return assets.map((asset) => analyzeCot(asset, reportsByAsset.get(asset.id) ?? []));
}

export function signalExplanation(signal: CotSignal, symbol: string, percentile: number | null) {
  const pctText = percentile == null ? "" : ` It is around the ${ordinal(percentile)} percentile of loaded history.`;
  const explanations: Record<CotSignal, string> = {
    "Crowded Long": `Speculators are heavily net long ${symbol}.${pctText} Trend can continue, but late long entries need tighter confirmation because positioning is crowded.`,
    "Crowded Short": `Speculators are heavily net short ${symbol}.${pctText} Bearish continuation is possible, but short-covering reversal risk is elevated.`,
    "Crowded Long Weakening": `Positioning is still crowded long in ${symbol}, but the latest adjusted weekly change weakened. Treat this as profit-taking or reversal risk.`,
    "Crowded Short Unwinding": `Positioning is still crowded short in ${symbol}, but the latest adjusted weekly change improved. Watch for bullish reversal confirmation.`,
    "Bullish Weekly Shift": `The latest adjusted non-commercial net position increased for ${symbol}. Use it as a bullish filter with price confirmation.`,
    "Bearish Weekly Shift": `The latest adjusted non-commercial net position fell for ${symbol}. Use it as a bearish filter with price confirmation.`,
    Neutral: `Positioning in ${symbol} is not at a useful extreme and the latest weekly change is not decisive.`,
    "Not Enough History": `Fewer than 10 weeks are loaded for ${symbol}. Add more history before trusting percentile or crowding signals.`
  };

  return explanations[signal];
}

export function cotSignalWeight(signal: CotSignal) {
  const weights: Record<CotSignal, number> = {
    "Crowded Long Weakening": 95,
    "Crowded Short Unwinding": 95,
    "Crowded Long": 80,
    "Crowded Short": 80,
    "Bullish Weekly Shift": 45,
    "Bearish Weekly Shift": 45,
    Neutral: 10,
    "Not Enough History": 0
  };

  return weights[signal];
}

function buildSignal(points: CotPoint[], percentile: number | null): CotSignal {
  if (points.length < 10 || percentile == null) {
    return "Not Enough History";
  }

  const latest = points.at(-1);
  if (!latest) {
    return "Neutral";
  }

  if (percentile >= 80 && latest.adjustedChange < 0) {
    return "Crowded Long Weakening";
  }

  if (percentile >= 80) {
    return "Crowded Long";
  }

  if (percentile <= 20 && latest.adjustedChange > 0) {
    return "Crowded Short Unwinding";
  }

  if (percentile <= 20) {
    return "Crowded Short";
  }

  if (latest.adjustedChange > 0) {
    return "Bullish Weekly Shift";
  }

  if (latest.adjustedChange < 0) {
    return "Bearish Weekly Shift";
  }

  return "Neutral";
}

function buildScore(points: CotPoint[], cotIndex52: number | null) {
  const latest = points.at(-1);
  if (!latest) {
    return 0;
  }

  const avgAbsChange = avgAbs(points.slice(-13).map((point) => point.adjustedChange)) || 1;
  const positionScore = cotIndex52 == null ? 0 : clamp((cotIndex52 - 50) * 1.35, -72, 72);
  const momentumScore = clamp((latest.adjustedChange / avgAbsChange) * 10, -18, 18);
  const streak = changeStreak(points);
  const streakScore =
    streak.count > 1 ? clamp(streak.sign * Math.min(streak.count * 3, 10), -10, 10) : 0;

  return Math.round(clamp(positionScore + momentumScore + streakScore, -100, 100));
}

function classifyMode(score: number, cotIndex52: number | null, adjustedChange: number) {
  if (cotIndex52 != null && cotIndex52 >= 85 && adjustedChange < 0) {
    return { group: "reversal" as const, label: "Reversal Short Watch", tradeBias: "short" as const };
  }

  if (cotIndex52 != null && cotIndex52 <= 15 && adjustedChange > 0) {
    return { group: "reversal" as const, label: "Reversal Long Watch", tradeBias: "long" as const };
  }

  if (score >= 35 && adjustedChange >= 0) {
    return { group: "trend" as const, label: "Trend Follow Long", tradeBias: "long" as const };
  }

  if (score <= -35 && adjustedChange <= 0) {
    return { group: "trend" as const, label: "Trend Follow Short", tradeBias: "short" as const };
  }

  if (cotIndex52 != null && cotIndex52 >= 80) {
    return { group: "reversal" as const, label: "Crowded Long", tradeBias: "short" as const };
  }

  if (cotIndex52 != null && cotIndex52 <= 20) {
    return { group: "reversal" as const, label: "Crowded Short", tradeBias: "long" as const };
  }

  if (score >= 25) {
    return { group: "trend" as const, label: "Bullish Filter", tradeBias: "long" as const };
  }

  if (score <= -25) {
    return { group: "trend" as const, label: "Bearish Filter", tradeBias: "short" as const };
  }

  return { group: "neutral" as const, label: "Neutral / Wait", tradeBias: "neutral" as const };
}

function cotIndexAt(points: Pick<CotPoint, "adjustedNet">[], index: number, lookback: number) {
  const slice = points
    .slice(Math.max(0, index - lookback + 1), index + 1)
    .filter((point) => Number.isFinite(point.adjustedNet));

  if (slice.length < 2) {
    return null;
  }

  const values = slice.map((point) => point.adjustedNet);
  const min = Math.min(...values);
  const max = Math.max(...values);

  if (max === min) {
    return 50;
  }

  return ((values.at(-1)! - min) / (max - min)) * 100;
}

function percentileForValue(values: number[], value: number) {
  const valid = values.filter(Number.isFinite).sort((a, b) => a - b);

  if (valid.length <= 1) {
    return value >= 0 ? 60 : 40;
  }

  return (valid.filter((candidate) => candidate < value).length / (valid.length - 1)) * 100;
}

function changeStreak(points: CotPoint[]) {
  const sign = Math.sign(points.at(-1)?.adjustedChange ?? 0);

  if (!sign) {
    return { sign: 0, count: 0 };
  }

  let count = 0;

  for (let index = points.length - 1; index >= 0; index -= 1) {
    if (Math.sign(points[index].adjustedChange) !== sign) {
      break;
    }

    count += 1;
  }

  return { sign, count };
}

function getFreshness(reportDate: string) {
  const date = new Date(`${reportDate}T00:00:00Z`);
  const daysOld = Math.floor((Date.now() - date.getTime()) / 86_400_000);

  if (!Number.isFinite(daysOld)) {
    return { label: "Unknown" as const, daysOld: null };
  }

  if (daysOld <= 10) {
    return { label: "Fresh" as const, daysOld };
  }

  if (daysOld <= 17) {
    return { label: "Check Update" as const, daysOld };
  }

  return { label: "Stale" as const, daysOld };
}

function avgAbs(values: number[]) {
  const valid = values.map((value) => Math.abs(value)).filter((value) => value > 0);
  return valid.length ? valid.reduce((sum, value) => sum + value, 0) / valid.length : 0;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function ordinal(value: number) {
  const rounded = Math.round(value);
  const mod100 = rounded % 100;
  const suffix = mod100 >= 11 && mod100 <= 13 ? "th" : ({ 1: "st", 2: "nd", 3: "rd" }[rounded % 10] ?? "th");
  return `${rounded}${suffix}`;
}
