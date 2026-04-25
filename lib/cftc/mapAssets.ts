import type { Asset } from "@/lib/types";
import type { AssetMatch, LegacyCotRow } from "@/lib/cftc/types";

export function normalizeCftcMarketName(value: string) {
  return value
    .toLowerCase()
    .replaceAll(/\s+/g, " ")
    .replaceAll(" - ", " ")
    .trim();
}

export function matchCftcRowsToAssets(rows: LegacyCotRow[], assets: Asset[]): AssetMatch[] {
  const assetsByMarket = new Map(
    assets.map((asset) => [normalizeCftcMarketName(asset.cftc_market_name), asset])
  );

  const matches: AssetMatch[] = [];

  for (const row of rows) {
    const marketName =
      row.market_and_exchange_names ||
      row.market_and_exchange_name ||
      row.cftc_market_name ||
      "";
    const asset = assetsByMarket.get(normalizeCftcMarketName(marketName));

    if (asset) {
      matches.push({
        assetId: asset.id,
        symbol: asset.symbol,
        cftcMarketName: asset.cftc_market_name
      });
    }
  }

  return matches;
}
