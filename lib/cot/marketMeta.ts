import type { Asset } from "@/lib/types";

export type MarketMeta = {
  symbol: string;
  group: string;
  multiplier: 1 | -1;
  view: string;
};

const USD_BASE_INVERTED = new Set(["USDJPY", "USDCHF", "USDCAD", "USDMXN", "USDBRL"]);

export function compactSymbol(value: string | null | undefined) {
  return String(value ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

export function resolveMarketMeta(
  asset: Pick<Asset, "symbol" | "display_name" | "category" | "cftc_market_name">
): MarketMeta {
  const symbol = compactSymbol(asset.symbol);
  const marketName = asset.cftc_market_name.toUpperCase();
  const category = asset.category ?? "Other";

  const multiplier: 1 | -1 = USD_BASE_INVERTED.has(symbol) ? -1 : 1;
  const group = /BITCOIN|ETHER|CRYPTO|BTC|ETH/.test(marketName)
    ? "Crypto"
    : category === "FX"
      ? "Currencies"
      : category;

  const view =
    multiplier === -1
      ? `${asset.display_name ?? asset.symbol} futures bullish = ${asset.symbol} bearish`
      : `${asset.display_name ?? asset.symbol} futures bullish = ${asset.symbol} bullish`;

  return {
    symbol: asset.symbol,
    group,
    multiplier,
    view
  };
}
