import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { AssetCotCard } from "@/components/dashboard/AssetCotCard";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { analyzeCot } from "@/lib/cot/analytics";
import { createClient } from "@/lib/supabase/server";
import type { Asset, CotReport } from "@/lib/types";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type WatchlistItemRow = {
  id: number;
  asset_id: number;
  notes: string;
  bias_label: "bullish" | "bearish" | "neutral" | "waiting";
  checklist: {
    bias?: boolean;
    level?: boolean;
    trigger?: boolean;
    risk?: boolean;
  };
  assets: Asset | null;
};

export default async function WatchlistPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: watchlists } = await supabase
    .from("watchlists")
    .select("id, name")
    .eq("user_id", user?.id ?? "")
    .order("created_at", { ascending: true });

  const watchlistIds = (watchlists ?? []).map((watchlist) => watchlist.id);

  if (!watchlistIds.length) {
    return (
      <>
        <PageHeader
          title="Watchlist"
          description="Your saved COT markets will appear here after you add assets."
        />
        <StatusMessage error={params.error} message={params.message} />
        <EmptyState
          action={<ButtonLink href="/dashboard/assets">Browse assets</ButtonLink>}
          title="No watchlist yet"
          body="Save your first asset and the app will create a default watchlist named My Watchlist."
        />
      </>
    );
  }

  const { data: items } = await supabase
    .from("watchlist_items")
    .select("id, asset_id, notes, bias_label, checklist, assets(*)")
    .in("watchlist_id", watchlistIds)
    .order("created_at", { ascending: true });

  const itemRows = (items ?? []) as unknown as WatchlistItemRow[];
  const assetIds = itemRows.map((item) => item.asset_id);
  const reportsByAsset = new Map<number, CotReport[]>();

  if (assetIds.length) {
    const { data: reports } = await supabase
      .from("cot_reports")
      .select("*")
      .in("asset_id", assetIds)
      .order("report_date", { ascending: true });

    for (const report of (reports ?? []) as CotReport[]) {
      const current = reportsByAsset.get(report.asset_id) ?? [];
      current.push(report);
      reportsByAsset.set(report.asset_id, current);
    }
  }

  const rankedItems = [...itemRows].sort((a, b) => {
    if (!a.assets || !b.assets) {
      return 0;
    }

    const aRank = analyzeCot(a.assets, reportsByAsset.get(a.asset_id) ?? []).rank;
    const bRank = analyzeCot(b.assets, reportsByAsset.get(b.asset_id) ?? []).rank;
    return bRank - aRank;
  });

  return (
    <>
      <PageHeader
        title="Watchlist"
        description="Saved markets with latest COT summaries and positioning history."
        action={<ButtonLink href="/dashboard/assets" variant="secondary">Add asset</ButtonLink>}
      />

      <StatusMessage error={params.error} message={params.message} />

      {itemRows.length ? (
        <section className="grid gap-5">
          {rankedItems.map((item) =>
            item.assets ? (
              <AssetCotCard
                key={item.id}
                asset={item.assets}
                item={item}
                reports={reportsByAsset.get(item.asset_id) ?? []}
              />
            ) : null
          )}
        </section>
      ) : (
        <EmptyState
          action={<ButtonLink href="/dashboard/assets">Browse assets</ButtonLink>}
          title="Your watchlist is empty"
          body="Search the asset catalog and save markets you want to monitor."
        />
      )}
    </>
  );
}
