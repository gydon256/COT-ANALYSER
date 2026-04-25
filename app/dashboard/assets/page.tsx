import { Search } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { saveAssetToWatchlistAction } from "@/lib/actions/watchlists";
import { createClient } from "@/lib/supabase/server";
import { ButtonLink } from "@/components/ui/Button";
import type { Asset } from "@/lib/types";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function matchesAsset(asset: Asset, query: string) {
  const haystack = [
    asset.symbol,
    asset.display_name,
    asset.cftc_market_name,
    asset.exchange,
    asset.category
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query.toLowerCase());
}

export default async function AssetsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = (firstParam(params.q) ?? "").trim();
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const [{ data: assets }, { data: watchlists }] = await Promise.all([
    supabase.from("assets").select("*").order("symbol", { ascending: true }),
    supabase.from("watchlists").select("id").eq("user_id", user?.id ?? "")
  ]);

  const watchlistIds = (watchlists ?? []).map((watchlist) => watchlist.id);
  const savedAssetIds = new Set<number>();

  if (watchlistIds.length) {
    const { data: items } = await supabase
      .from("watchlist_items")
      .select("asset_id")
      .in("watchlist_id", watchlistIds);

    for (const item of items ?? []) {
      savedAssetIds.add(item.asset_id);
    }
  }

  const filteredAssets = ((assets ?? []) as Asset[]).filter((asset) =>
    query ? matchesAsset(asset, query) : true
  );

  return (
    <>
      <PageHeader
        title="Assets"
        description="Search seeded CFTC markets and save the ones you monitor to your private watchlist."
      />

      <StatusMessage error={params.error} message={params.message} />

      <Card>
        <CardBody>
          <form className="flex flex-col gap-3 sm:flex-row" method="get">
            <label className="relative flex-1" htmlFor="asset-search">
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
                placeholder="Search symbol, market, exchange, or category"
                type="search"
              />
            </label>
            <Button type="submit" variant="secondary">
              Search
            </Button>
          </form>
        </CardBody>
      </Card>

      {filteredAssets.length ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredAssets.map((asset) => {
            const saved = savedAssetIds.has(asset.id);

            return (
              <Card key={asset.id}>
                <CardBody className="grid h-full gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-bold text-slate-950">{asset.symbol}</h2>
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                        {asset.category ?? "Market"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-700">
                      {asset.display_name}
                    </p>
                    <p className="mt-3 text-xs leading-5 text-slate-500">{asset.cftc_market_name}</p>
                    <p className="mt-2 text-xs text-slate-500">{asset.exchange ?? "Exchange n/a"}</p>
                  </div>

                  <div className="mt-auto grid gap-2 sm:grid-cols-2">
                    <ButtonLink href={`/dashboard/assets/${encodeURIComponent(asset.symbol)}`} variant="secondary">
                      Details
                    </ButtonLink>
                    <form action={saveAssetToWatchlistAction}>
                      <input name="assetId" type="hidden" value={asset.id} />
                      <input name="returnTo" type="hidden" value="/dashboard/assets" />
                      <SubmitButton
                        className="w-full"
                        pendingLabel="Saving..."
                        variant={saved ? "secondary" : "primary"}
                      >
                        {saved ? "Saved" : "Save"}
                      </SubmitButton>
                    </form>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </section>
      ) : (
        <EmptyState
          title="No assets found"
          body="Try a symbol such as EURUSD, XAUUSD, USOIL, ETH, or search by exchange/category."
        />
      )}
    </>
  );
}
