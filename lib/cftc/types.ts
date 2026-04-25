import type { CotReport } from "@/lib/types";

export type LegacyCotRow = Record<string, string>;

export type ParsedCotReport = Omit<CotReport, "id" | "created_at">;

export type AssetMatch = {
  assetId: number;
  symbol: string;
  cftcMarketName: string;
};
