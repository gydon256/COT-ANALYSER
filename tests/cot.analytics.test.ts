import { describe, expect, it } from "vitest";
import { analyzeCot } from "../lib/cot/analytics";
import type { Asset, CotReport } from "../lib/types";

const asset: Asset = {
  id: 1,
  symbol: "EURUSD",
  display_name: "Euro FX",
  cftc_market_name: "EURO FX - CHICAGO MERCANTILE EXCHANGE",
  exchange: "Chicago Mercantile Exchange",
  category: "FX",
  created_at: "2026-01-01T00:00:00Z"
};

function report(index: number, net: number): CotReport {
  return {
    id: index,
    asset_id: 1,
    report_date: `2026-03-${String(index + 1).padStart(2, "0")}`,
    open_interest: 100_000 + index,
    non_commercial_long: 50_000 + net,
    non_commercial_short: 50_000,
    non_commercial_net: net,
    commercial_long: 40_000,
    commercial_short: 40_000 + net,
    commercial_net: -net,
    non_reportable_long: 10_000,
    non_reportable_short: 10_000,
    non_reportable_net: 0,
    created_at: "2026-01-01T00:00:00Z"
  };
}

describe("analyzeCot", () => {
  it("detects crowded long weakening when high percentile weakens", () => {
    const reports = [10, 20, 30, 40, 50, 60, 70, 80, 100, 90].map((net, index) =>
      report(index, net)
    );

    const analysis = analyzeCot(asset, reports);

    expect(analysis.signal).toBe("Crowded Long Weakening");
    expect(analysis.latest?.adjustedChange).toBe(-10);
    expect(analysis.cotIndex13).toBeGreaterThan(80);
  });

  it("inverts USD-base FX pairs", () => {
    const usdJpyAsset = {
      ...asset,
      symbol: "USDJPY",
      display_name: "Japanese Yen",
      cftc_market_name: "JAPANESE YEN - CHICAGO MERCANTILE EXCHANGE"
    };

    const analysis = analyzeCot(usdJpyAsset, [report(0, 100), report(1, 140)]);

    expect(analysis.latest?.adjustedNet).toBe(-140);
    expect(analysis.latest?.adjustedChange).toBe(-40);
  });
});
