import { fetchCftcJson } from "@/lib/cftc/fetchCftc";
import { mapLegacyRowToReport, type CftcLegacyApiRow } from "@/lib/cftc/legacyApi";
import type { ParsedCotReport } from "@/lib/cftc/types";

export const ALLOWED_FETCH_WEEKS = [52, 126] as const;
export type AllowedFetchWeeks = (typeof ALLOWED_FETCH_WEEKS)[number];

export type AllowedVenueCode = "CME" | "COMEX" | "NYMEX";

export type AllowedVenue = {
  code: AllowedVenueCode;
  name: string;
  label: string;
  rank: number;
};

export const ALLOWED_VENUES: AllowedVenue[] = [
  {
    code: "CME",
    name: "CHICAGO MERCANTILE EXCHANGE",
    label: "CME (preferred)",
    rank: 0
  },
  {
    code: "COMEX",
    name: "COMMODITY EXCHANGE INC.",
    label: "COMEX",
    rank: 1
  },
  {
    code: "NYMEX",
    name: "NEW YORK MERCANTILE EXCHANGE",
    label: "NYMEX",
    rank: 1
  }
];

export const CFTC_LEGACY_FUTURES_ONLY_ENDPOINT =
  "https://publicreporting.cftc.gov/resource/6dca-aqww.json";

export type KnownMarketAlias = {
  symbol: string;
  displayName: string;
  cftcMarketName: string;
  category: string;
  aliases: string[];
};

export type AllowedCftcMarket = {
  symbol: string;
  displayName: string;
  cftcMarketName: string;
  exchange: string;
  category: string;
  venueCode: AllowedVenueCode;
  venueLabel: string;
  isPreferredVenue: boolean;
  commodityName: string | null;
  commodityGroupName: string | null;
  commoditySubgroupName: string | null;
  contractMarketCode: string | null;
  latestReportDate: string | null;
  knownAlias: boolean;
};

type CftcMarketSearchRow = {
  market_and_exchange_names?: string;
  commodity_name?: string;
  commodity_group_name?: string;
  commodity_subgroup_name?: string;
  cftc_contract_market_code?: string;
  max_report_date_as_yyyy_mm_dd?: string;
};

const KNOWN_ALIASES: KnownMarketAlias[] = [
  market("EURUSD", "Euro FX", "EURO FX - CHICAGO MERCANTILE EXCHANGE", "FX", [
    "EURUSD",
    "EUR/USD",
    "EUR",
    "EURO"
  ]),
  market("GBPUSD", "British Pound", "BRITISH POUND - CHICAGO MERCANTILE EXCHANGE", "FX", [
    "GBPUSD",
    "GBP/USD",
    "GBP",
    "POUND"
  ]),
  market("USDJPY", "Japanese Yen", "JAPANESE YEN - CHICAGO MERCANTILE EXCHANGE", "FX", [
    "USDJPY",
    "USD/JPY",
    "JPY",
    "YEN"
  ]),
  market("USDCHF", "Swiss Franc", "SWISS FRANC - CHICAGO MERCANTILE EXCHANGE", "FX", [
    "USDCHF",
    "USD/CHF",
    "CHF",
    "FRANC"
  ]),
  market("USDCAD", "Canadian Dollar", "CANADIAN DOLLAR - CHICAGO MERCANTILE EXCHANGE", "FX", [
    "USDCAD",
    "USD/CAD",
    "CAD"
  ]),
  market("AUDUSD", "Australian Dollar", "AUSTRALIAN DOLLAR - CHICAGO MERCANTILE EXCHANGE", "FX", [
    "AUDUSD",
    "AUD/USD",
    "AUD"
  ]),
  market("NZDUSD", "New Zealand Dollar", "NEW ZEALAND DOLLAR - CHICAGO MERCANTILE EXCHANGE", "FX", [
    "NZDUSD",
    "NZD/USD",
    "NZD",
    "KIWI"
  ]),
  market("USDMXN", "Mexican Peso", "MEXICAN PESO - CHICAGO MERCANTILE EXCHANGE", "FX", [
    "USDMXN",
    "USD/MXN",
    "MXN"
  ]),
  market("USDBRL", "Brazilian Real", "BRAZILIAN REAL - CHICAGO MERCANTILE EXCHANGE", "FX", [
    "USDBRL",
    "USD/BRL",
    "BRL"
  ]),
  market("US500", "E-mini S&P 500", "E-MINI S&P 500 - CHICAGO MERCANTILE EXCHANGE", "Indices", [
    "US500",
    "SPX500",
    "SP500",
    "S&P500",
    "S&P 500",
    "ES"
  ]),
  market(
    "NAS100",
    "Nasdaq-100",
    "NASDAQ-100 STOCK INDEX - CHICAGO MERCANTILE EXCHANGE",
    "Indices",
    ["NAS100", "NASDAQ", "NDX", "US100", "NQ"]
  ),
  market("BTC", "Bitcoin", "BITCOIN - CHICAGO MERCANTILE EXCHANGE", "Crypto", [
    "BTC",
    "BTCUSD",
    "BITCOIN"
  ]),
  market("ETH", "Ether Cash Settled", "ETHER CASH SETTLED - CHICAGO MERCANTILE EXCHANGE", "Crypto", [
    "ETH",
    "ETHUSD",
    "ETHER",
    "ETHEREUM"
  ]),
  market(
    "USOIL",
    "WTI Financial Crude Oil",
    "WTI FINANCIAL CRUDE OIL - NEW YORK MERCANTILE EXCHANGE",
    "Energy",
    ["USOIL", "US OIL", "WTI", "WTIUSD", "WTI OIL"]
  ),
  market(
    "UKOIL",
    "Brent Last Day",
    "BRENT LAST DAY - NEW YORK MERCANTILE EXCHANGE",
    "Energy",
    ["UKOIL", "UK OIL", "BRENT", "BRENTUSD", "BRENT OIL"]
  ),
  market("XAUUSD", "Gold", "GOLD - COMMODITY EXCHANGE INC.", "Metals", [
    "XAUUSD",
    "XAU/USD",
    "GOLD"
  ]),
  market("XAGUSD", "Silver", "SILVER - COMMODITY EXCHANGE INC.", "Metals", [
    "XAGUSD",
    "XAG/USD",
    "SILVER"
  ])
];

function market(
  symbol: string,
  displayName: string,
  cftcMarketName: string,
  category: string,
  aliases: string[]
): KnownMarketAlias {
  return { symbol, displayName, cftcMarketName, category, aliases };
}

export function normalizeTraderSymbol(value: string | null | undefined) {
  return String(value ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

export function validateFetchWeeks(value: unknown): AllowedFetchWeeks {
  const numeric = Number(value ?? 52);
  if (numeric === 126) {
    return 126;
  }
  return 52;
}

export function resolveKnownAlias(value: string | null | undefined) {
  const normalized = normalizeTraderSymbol(value);
  if (!normalized) {
    return null;
  }

  return (
    KNOWN_ALIASES.find((alias) =>
      alias.aliases.some((candidate) => normalizeTraderSymbol(candidate) === normalized)
    ) ?? null
  );
}

export function resolveKnownMarketName(cftcMarketName: string) {
  const normalized = normalizeCftcName(cftcMarketName);
  return KNOWN_ALIASES.find((alias) => normalizeCftcName(alias.cftcMarketName) === normalized) ?? null;
}

export function getAllowedVenue(cftcMarketName: string) {
  const normalized = cftcMarketName.toUpperCase();
  return ALLOWED_VENUES.find((venue) => normalized.endsWith(`- ${venue.name}`)) ?? null;
}

export function isAllowedCftcMarketName(cftcMarketName: string) {
  return Boolean(getAllowedVenue(cftcMarketName));
}

export async function searchAllowedCftcMarkets(options: {
  query: string;
  weeks?: unknown;
  limit?: number;
}): Promise<AllowedCftcMarket[]> {
  const query = options.query.trim();
  if (!query) {
    return [];
  }

  const weeks = validateFetchWeeks(options.weeks);
  const limit = options.limit ?? 25;
  const known = resolveKnownAlias(query);
  const rows = known
    ? await searchExactMarket(known.cftcMarketName, weeks)
    : await searchMarketsByText(query, weeks, limit);

  const matches = rows
    .map((row) => rowToAllowedMarket(row, known))
    .filter((match): match is AllowedCftcMarket => Boolean(match));

  return sortAllowedMarketsForDisplay(dedupeMarkets(matches));
}

export async function getAllowedCftcMarketByName(options: {
  cftcMarketName: string;
  query?: string | null;
  weeks?: unknown;
}) {
  const cftcMarketName = options.cftcMarketName.trim();
  if (!isAllowedCftcMarketName(cftcMarketName)) {
    throw new Error("Only CME, COMEX, and NYMEX CFTC markets can be imported.");
  }

  const rows = await searchExactMarket(cftcMarketName, validateFetchWeeks(options.weeks));
  const knownFromQuery = resolveKnownAlias(options.query);
  const known =
    knownFromQuery?.cftcMarketName === cftcMarketName
      ? knownFromQuery
      : resolveKnownMarketName(cftcMarketName);
  const match = rows.map((row) => rowToAllowedMarket(row, known)).find(Boolean);

  if (!match) {
    throw new Error("No recent importable CFTC rows were found for this market.");
  }

  return match;
}

export async function fetchAllowedMarketHistory(options: {
  cftcMarketName: string;
  assetId: number;
  weeks?: unknown;
}): Promise<ParsedCotReport[]> {
  if (!isAllowedCftcMarketName(options.cftcMarketName)) {
    throw new Error("Only CME, COMEX, and NYMEX CFTC markets can be imported.");
  }

  const weeks = validateFetchWeeks(options.weeks);
  const cutoffDate = cutoffDateForWeeks(weeks);
  const params = new URLSearchParams({
    "$where": `market_and_exchange_names=${soqlString(options.cftcMarketName)} AND report_date_as_yyyy_mm_dd >= ${soqlString(cutoffDate)}`,
    "$order": "report_date_as_yyyy_mm_dd ASC",
    "$limit": String(weeks + 12)
  });

  const rows = await fetchCftcJson<CftcLegacyApiRow[]>(
    `${CFTC_LEGACY_FUTURES_ONLY_ENDPOINT}?${params}`
  );

  return rows
    .map((row) => mapLegacyRowToReport(options.assetId, row))
    .filter((report): report is ParsedCotReport => report != null);
}

export function marketAliasRows(assetId: number, market: AllowedCftcMarket) {
  const aliases = new Set<string>([market.symbol, market.displayName, market.cftcMarketName]);
  const known = resolveKnownMarketName(market.cftcMarketName);

  for (const alias of known?.aliases ?? []) {
    aliases.add(alias);
  }

  return Array.from(aliases)
    .map((alias) => alias.trim())
    .filter(Boolean)
    .map((alias) => ({
      asset_id: assetId,
      alias,
      normalized_alias: normalizeTraderSymbol(alias),
      kind: alias === market.cftcMarketName ? "cftc_market_name" : "trader_symbol"
    }));
}

function rowToAllowedMarket(row: CftcMarketSearchRow, knownForQuery: KnownMarketAlias | null) {
  const cftcMarketName = row.market_and_exchange_names?.trim();
  if (!cftcMarketName) {
    return null;
  }

  const venue = getAllowedVenue(cftcMarketName);
  if (!venue) {
    return null;
  }

  const known = knownForQuery?.cftcMarketName === cftcMarketName
    ? knownForQuery
    : resolveKnownMarketName(cftcMarketName);
  const symbol = known?.symbol ?? symbolFromMarket(row, venue.code);
  const displayName = known?.displayName ?? displayNameFromMarket(row);
  const category = known?.category ?? categoryFromMarket(row);

  return {
    symbol,
    displayName,
    cftcMarketName,
    exchange: titleCase(venue.name),
    category,
    venueCode: venue.code,
    venueLabel: venue.label,
    isPreferredVenue: venue.code === "CME",
    commodityName: row.commodity_name ?? null,
    commodityGroupName: row.commodity_group_name ?? null,
    commoditySubgroupName: row.commodity_subgroup_name ?? null,
    contractMarketCode: row.cftc_contract_market_code?.trim() || null,
    latestReportDate: row.max_report_date_as_yyyy_mm_dd?.slice(0, 10) ?? null,
    knownAlias: Boolean(known)
  };
}

function sortMarkets(a: AllowedCftcMarket, b: AllowedCftcMarket) {
  const venueRank = (getAllowedVenue(a.cftcMarketName)?.rank ?? 9) - (getAllowedVenue(b.cftcMarketName)?.rank ?? 9);
  if (venueRank !== 0) {
    return venueRank;
  }

  if (a.knownAlias !== b.knownAlias) {
    return a.knownAlias ? -1 : 1;
  }

  return a.cftcMarketName.localeCompare(b.cftcMarketName);
}

export function sortAllowedMarketsForDisplay(markets: AllowedCftcMarket[]) {
  return [...markets].sort(sortMarkets);
}

function dedupeMarkets(markets: AllowedCftcMarket[]) {
  const seen = new Set<string>();
  const deduped: AllowedCftcMarket[] = [];

  for (const market of markets) {
    const key = normalizeCftcName(market.cftcMarketName);
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(market);
    }
  }

  return deduped;
}

async function searchExactMarket(cftcMarketName: string, weeks: AllowedFetchWeeks) {
  const params = baseSearchParams(weeks);
  params.set(
    "$where",
    `${dateWhere(weeks)} AND market_and_exchange_names=${soqlString(cftcMarketName)} AND (${allowedVenueWhere()})`
  );

  return fetchCftcJson<CftcMarketSearchRow[]>(`${CFTC_LEGACY_FUTURES_ONLY_ENDPOINT}?${params}`);
}

async function searchMarketsByText(query: string, weeks: AllowedFetchWeeks, limit: number) {
  const normalized = query.trim();
  const normalizedSymbol = normalizeTraderSymbol(normalized);
  const terms = Array.from(
    new Set([normalized, normalizedSymbol.length > 2 ? normalizedSymbol : ""].filter(Boolean))
  );
  const textWhere = terms
    .map((term) => {
      const pattern = `%${term.replaceAll("'", "''")}%`;
      return [
        `upper(market_and_exchange_names) like upper(${soqlString(pattern)})`,
        `upper(commodity_name) like upper(${soqlString(pattern)})`
      ].join(" OR ");
    })
    .map((clause) => `(${clause})`)
    .join(" OR ");

  const params = baseSearchParams(weeks);
  params.set("$where", `${dateWhere(weeks)} AND (${allowedVenueWhere()}) AND (${textWhere})`);
  params.set("$limit", String(limit));

  return fetchCftcJson<CftcMarketSearchRow[]>(`${CFTC_LEGACY_FUTURES_ONLY_ENDPOINT}?${params}`);
}

function baseSearchParams(weeks: AllowedFetchWeeks) {
  return new URLSearchParams({
    "$select": [
      "market_and_exchange_names",
      "commodity_name",
      "commodity_group_name",
      "commodity_subgroup_name",
      "cftc_contract_market_code",
      "max(report_date_as_yyyy_mm_dd)"
    ].join(","),
    "$where": dateWhere(weeks),
    "$group": [
      "market_and_exchange_names",
      "commodity_name",
      "commodity_group_name",
      "commodity_subgroup_name",
      "cftc_contract_market_code"
    ].join(","),
    "$order": "market_and_exchange_names ASC",
    "$limit": "25"
  });
}

function dateWhere(weeks: AllowedFetchWeeks) {
  return `report_date_as_yyyy_mm_dd >= ${soqlString(cutoffDateForWeeks(weeks))}`;
}

function cutoffDateForWeeks(weeks: AllowedFetchWeeks) {
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - weeks * 7);
  return cutoff.toISOString().slice(0, 10);
}

function allowedVenueWhere() {
  return ALLOWED_VENUES.map((venue) =>
    `upper(market_and_exchange_names) like upper(${soqlString(`% - ${venue.name}`)})`
  ).join(" OR ");
}

function soqlString(value: string) {
  return `'${value.replaceAll("'", "''")}'`;
}

function normalizeCftcName(value: string) {
  return value.toUpperCase().replace(/\s+/g, " ").trim();
}

function symbolFromMarket(row: CftcMarketSearchRow, venueCode: AllowedVenueCode) {
  const code = row.cftc_contract_market_code?.trim().replace(/[^A-Z0-9]/gi, "").toUpperCase();
  if (code) {
    return `${venueCode}_${code}`;
  }

  return normalizeTraderSymbol(row.market_and_exchange_names).slice(0, 24) || `${venueCode}_MARKET`;
}

function displayNameFromMarket(row: CftcMarketSearchRow) {
  const marketName = row.market_and_exchange_names ?? "CFTC market";
  return titleCase(marketName.split(" - ")[0] ?? marketName);
}

function categoryFromMarket(row: CftcMarketSearchRow) {
  const group = row.commodity_group_name ?? "";
  const subgroup = row.commodity_subgroup_name ?? "";
  const joined = `${group} ${subgroup}`.toUpperCase();

  if (joined.includes("CURRENCY")) return "FX";
  if (joined.includes("STOCK INDICES")) return "Indices";
  if (joined.includes("DIGITAL ASSET")) return "Crypto";
  if (joined.includes("METALS")) return "Metals";
  if (joined.includes("ENERGY") || joined.includes("NATURAL RESOURCES")) return "Energy";
  if (joined.includes("AGRICULTURE")) return "Agriculture";
  if (joined.includes("INTEREST") || joined.includes("FINANCIAL")) return "Financials";

  return "Market";
}

function titleCase(value: string) {
  return value
    .toLowerCase()
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase())
    .replace(/\bUs\b/g, "U.S.")
    .replace(/\bCme\b/g, "CME")
    .replace(/\bNymex\b/g, "NYMEX")
    .replace(/\bComex\b/g, "COMEX");
}
