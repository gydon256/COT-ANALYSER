import { describe, expect, it } from "vitest";
import {
  getAllowedVenue,
  isAllowedCftcMarketName,
  resolveKnownAlias,
  sortAllowedMarketsForDisplay,
  validateFetchWeeks,
  type AllowedCftcMarket
} from "../lib/cftc/allowedMarkets";

function market(overrides: Partial<AllowedCftcMarket>): AllowedCftcMarket {
  return {
    symbol: "TEST",
    displayName: "Test",
    cftcMarketName: "TEST - NEW YORK MERCANTILE EXCHANGE",
    exchange: "New York Mercantile Exchange",
    category: "Energy",
    venueCode: "NYMEX",
    venueLabel: "NYMEX",
    isPreferredVenue: false,
    commodityName: null,
    commodityGroupName: null,
    commoditySubgroupName: null,
    contractMarketCode: null,
    latestReportDate: "2026-04-21",
    knownAlias: false,
    ...overrides
  };
}

describe("allowed CFTC markets", () => {
  it("prefers CME results in display ordering", () => {
    const sorted = sortAllowedMarketsForDisplay([
      market({
        cftcMarketName: "GOLD - COMMODITY EXCHANGE INC.",
        venueCode: "COMEX",
        venueLabel: "COMEX"
      }),
      market({
        cftcMarketName: "EURO FX - CHICAGO MERCANTILE EXCHANGE",
        venueCode: "CME",
        venueLabel: "CME (preferred)",
        isPreferredVenue: true
      }),
      market({
        cftcMarketName: "WTI FINANCIAL CRUDE OIL - NEW YORK MERCANTILE EXCHANGE"
      })
    ]);

    expect(sorted[0].venueLabel).toBe("CME (preferred)");
    expect(sorted[0].isPreferredVenue).toBe(true);
  });

  it("rejects unsupported venues", () => {
    expect(isAllowedCftcMarketName("U.S. DOLLAR INDEX - ICE FUTURES U.S.")).toBe(false);
    expect(getAllowedVenue("GOLD - COMMODITY EXCHANGE INC.")?.code).toBe("COMEX");
    expect(getAllowedVenue("WTI FINANCIAL CRUDE OIL - NEW YORK MERCANTILE EXCHANGE")?.code).toBe("NYMEX");
  });

  it("maps common trader aliases to active official CFTC names", () => {
    expect(resolveKnownAlias("USOIL")?.cftcMarketName).toBe(
      "WTI FINANCIAL CRUDE OIL - NEW YORK MERCANTILE EXCHANGE"
    );
    expect(resolveKnownAlias("UK oil")?.cftcMarketName).toBe(
      "BRENT LAST DAY - NEW YORK MERCANTILE EXCHANGE"
    );
    expect(resolveKnownAlias("XAUUSD")?.cftcMarketName).toBe("GOLD - COMMODITY EXCHANGE INC.");
    expect(resolveKnownAlias("silver")?.cftcMarketName).toBe("SILVER - COMMODITY EXCHANGE INC.");
  });

  it("limits history to 52 or 126 weeks", () => {
    expect(validateFetchWeeks(undefined)).toBe(52);
    expect(validateFetchWeeks(52)).toBe(52);
    expect(validateFetchWeeks(126)).toBe(126);
    expect(validateFetchWeeks(260)).toBe(52);
  });
});
