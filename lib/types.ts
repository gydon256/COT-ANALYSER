export type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
  role: string;
  plan: string;
  created_at: string;
};

export type Asset = {
  id: number;
  symbol: string;
  display_name: string;
  cftc_market_name: string;
  exchange: string | null;
  category: string | null;
  created_at: string;
};

export type CotReport = {
  id: number;
  asset_id: number;
  report_date: string;
  open_interest: number | null;
  non_commercial_long: number | null;
  non_commercial_short: number | null;
  non_commercial_net: number | null;
  commercial_long: number | null;
  commercial_short: number | null;
  commercial_net: number | null;
  non_reportable_long: number | null;
  non_reportable_short: number | null;
  non_reportable_net: number | null;
  created_at: string;
};

export type Watchlist = {
  id: number;
  user_id: string;
  name: string;
  created_at: string;
};

export type WatchlistItem = {
  id: number;
  watchlist_id: number;
  asset_id: number;
  created_at: string;
  notes: string;
  bias_label: "bullish" | "bearish" | "neutral" | "waiting";
  checklist: {
    bias?: boolean;
    level?: boolean;
    trigger?: boolean;
    risk?: boolean;
  };
  updated_at: string;
};

export type AssetAlias = {
  id: number;
  asset_id: number;
  alias: string;
  normalized_alias: string;
  kind: string;
  created_at: string;
};

export type Alert = {
  id: number;
  user_id: string;
  asset_id: number;
  alert_type: string | null;
  condition: string | null;
  is_active: boolean;
  created_at: string;
};

export type IngestionRun = {
  id: number;
  started_at: string;
  finished_at: string | null;
  status: string;
  source: string;
  assets_checked: number;
  reports_upserted: number;
  latest_report_date: string | null;
  error_message: string | null;
  created_by: string | null;
};

export type IngestionAssetResult = {
  id: number;
  run_id: number | null;
  asset_id: number | null;
  symbol: string | null;
  cftc_market_name: string;
  status: string;
  rows_upserted: number;
  latest_report_date: string | null;
  error_message: string | null;
  created_at: string;
};

export type AssetWithReports = Asset & {
  reports: CotReport[];
};
