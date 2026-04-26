import { DatabaseZap, Search } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { fetchAndSaveCftcAssetAction } from "@/lib/actions/assets";
import {
  searchAllowedCftcMarkets,
  validateFetchWeeks,
  type AllowedCftcMarket
} from "@/lib/cftc/allowedMarkets";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AssetsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = (firstParam(params.q) ?? "").trim();
  const weeks = validateFetchWeeks(firstParam(params.weeks));
  let results: AllowedCftcMarket[] = [];
  let searchError: string | undefined;

  if (query) {
    try {
      results = await searchAllowedCftcMarkets({ query, weeks });
    } catch (error) {
      searchError = error instanceof Error ? error.message : "CFTC search failed.";
    }
  }

  return (
    <>
      <PageHeader
        title="Assets"
        description="Search CME, COMEX, and NYMEX CFTC markets, fetch public history, and save the result to your watchlist."
      />

      <StatusMessage error={params.error ?? searchError} message={params.message} />

      <Card>
        <CardHeader>
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-950">
            <Search size={20} aria-hidden="true" />
            Live CFTC search
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Try EURUSD, USDJPY, USOIL, UKOIL, XAUUSD, XAGUSD, US500, NAS100, BTC, or an
            official market name. CME results are preferred; COMEX and NYMEX are allowed for
            metals and energy.
          </p>
        </CardHeader>
        <CardBody>
          <form className="grid gap-3 lg:grid-cols-[1fr_180px_auto] lg:items-end" method="get">
            <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="asset-search">
              <span>Symbol or CFTC market</span>
              <span className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                  aria-hidden="true"
                />
                <input
                  className="min-h-11 w-full rounded-md border border-slate-300 bg-white py-2 pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                  defaultValue={query}
                  id="asset-search"
                  name="q"
                  placeholder="Search symbol, market, or commodity"
                  type="search"
                />
              </span>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="weeks">
              <span>History</span>
              <select
                className="min-h-11 rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                defaultValue={String(weeks)}
                id="weeks"
                name="weeks"
              >
                <option value="52">52 weeks recommended</option>
                <option value="126">126 weeks maximum</option>
              </select>
            </label>
            <Button type="submit" variant="secondary">
              Search CFTC
            </Button>
          </form>
        </CardBody>
      </Card>

      {query ? (
        <SearchResults query={query} results={results} weeks={weeks} />
      ) : (
        <EmptyState
          title="Search before importing"
          body="The broad CFTC catalog stays hidden until you search. Fetched public reports are stored once and then saved to your private watchlist."
        />
      )}
    </>
  );
}

function SearchResults({
  query,
  results,
  weeks
}: {
  query: string;
  results: AllowedCftcMarket[];
  weeks: 52 | 126;
}) {
  if (!results.length) {
    return (
      <EmptyState
        title="No importable markets found"
        body="Only CME, COMEX, and NYMEX Legacy Futures Only markets are importable in this workflow. Try a trader symbol such as USOIL, UKOIL, XAUUSD, USDJPY, or US500."
      />
    );
  }

  return (
    <section className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Importable matches</h2>
          <p className="mt-1 text-sm text-slate-600">
            {results.length} result{results.length === 1 ? "" : "s"} for "{query}". Fetching imports{" "}
            {weeks} weeks and saves the market to your watchlist.
          </p>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {results.map((result) => (
          <Card key={result.cftcMarketName}>
            <CardBody className="grid h-full gap-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-950">{result.symbol}</h3>
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                      {result.category}
                    </span>
                    <span className="rounded-md bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-900">
                      {result.venueLabel}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-700">{result.displayName}</p>
                </div>
                <DatabaseZap className="text-slate-400" size={20} aria-hidden="true" />
              </div>

              <div className="rounded-md bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                <p className="font-semibold text-slate-800">{result.cftcMarketName}</p>
                <p className="mt-1">
                  Latest available report: {formatDate(result.latestReportDate)} -{" "}
                  {result.isPreferredVenue ? "CME preferred mapping" : "Allowed venue mapping"}
                </p>
              </div>

              <form action={fetchAndSaveCftcAssetAction} className="mt-auto">
                <input name="cftcMarketName" type="hidden" value={result.cftcMarketName} />
                <input name="query" type="hidden" value={query} />
                <input name="weeks" type="hidden" value={String(weeks)} />
                <SubmitButton className="w-full" pendingLabel="Fetching CFTC history...">
                  {`Fetch ${weeks} weeks and save`}
                </SubmitButton>
              </form>
            </CardBody>
          </Card>
        ))}
      </div>
    </section>
  );
}
