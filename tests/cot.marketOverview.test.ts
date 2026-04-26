import { describe, expect, it } from "vitest";
import { buildMarketOverviewRows, marketOverviewToCsv } from "../lib/cot/marketOverview";
import type { Asset, CotReport } from "../lib/types";

const asset: Asset = {
  id: 1,
  symbol: "USOIL",
  display_name: "WTI Financial Crude Oil",
  cftc_market_name: "WTI FINANCIAL CRUDE OIL - NEW YORK MERCANTILE EXCHANGE",
  exchange: "New York Mercantile Exchange",
  category: "Energy",
  created_at: "2026-01-01T00:00:00Z"
};

function report(index: number, net: number): CotReport {
  return {
    id: index,
    asset_id: 1,
    report_date: `2026-02-${String(index + 1).padStart(2, "0")}`,
    open_interest: 100_000,
    non_commercial_long: 60_000 + net,
    non_commercial_short: 60_000,
    non_commercial_net: net,
    commercial_long: 50_000,
    commercial_short: 50_000 + net,
    commercial_net: -net,
    non_reportable_long: 1_000,
    non_reportable_short: 1_000,
    non_reportable_net: 0,
    created_at: "2026-01-01T00:00:00Z"
  };
}

describe("market overview", () => {
  it("builds rows and exports signal context to CSV", () => {
    const rows = buildMarketOverviewRows(
      [asset],
      [10, 20, 30, 40, 50, 60, 70, 80, 100, 90].map((net, index) => report(index, net))
    );
    const csv = marketOverviewToCsv(rows);

    expect(rows).toHaveLength(1);
    expect(csv).toContain("USOIL");
    expect(csv).toContain("WTI FINANCIAL CRUDE OIL - NEW YORK MERCANTILE EXCHANGE");
    expect(csv).toContain("Crowded Long Weakening");
  });
});
