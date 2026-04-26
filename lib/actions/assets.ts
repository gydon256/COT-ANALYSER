"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  getAllowedCftcMarketByName,
  validateFetchWeeks
} from "@/lib/cftc/allowedMarkets";
import { fetchAndUpsertAllowedMarket } from "@/lib/cftc/upsertFetchedMarket";
import { getErrorMessage } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";

const fetchAssetSchema = z.object({
  cftcMarketName: z.string().trim().min(3),
  query: z.string().trim().optional(),
  weeks: z.coerce.number().optional()
});

function encodeMessage(message: string) {
  return encodeURIComponent(message);
}

function withStatus(path: string, key: "error" | "message", message: string) {
  return `${path}${path.includes("?") ? "&" : "?"}${key}=${encodeMessage(message)}`;
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  return { supabase, user };
}

async function getOrCreateDefaultWatchlist(userId: string) {
  const supabase = await createClient();
  const { data: existing, error: existingError } = await supabase
    .from("watchlists")
    .select("id")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existing) {
    return existing.id;
  }

  const { data: created, error: createError } = await supabase
    .from("watchlists")
    .insert({
      user_id: userId,
      name: "My Watchlist"
    })
    .select("id")
    .single();

  if (createError) {
    throw createError;
  }

  return created.id;
}

export async function fetchAndSaveCftcAssetAction(formData: FormData) {
  const parsed = fetchAssetSchema.safeParse({
    cftcMarketName: formData.get("cftcMarketName"),
    query: formData.get("query"),
    weeks: formData.get("weeks")
  });

  const query = typeof formData.get("query") === "string" ? String(formData.get("query")) : "";
  const returnTo = `/dashboard/assets${query ? `?q=${encodeURIComponent(query)}` : ""}`;

  if (!parsed.success) {
    redirect(withStatus(returnTo, "error", "Choose a valid CFTC market to fetch."));
  }

  const weeks = validateFetchWeeks(parsed.data.weeks);
  const { supabase, user } = await requireUser();
  let destination = "/dashboard/assets";

  try {
    const market = await getAllowedCftcMarketByName({
      cftcMarketName: parsed.data.cftcMarketName,
      query: parsed.data.query,
      weeks
    });
    const result = await fetchAndUpsertAllowedMarket({
      market,
      weeks,
      createdBy: user.id,
      createRun: true,
      source: "user_live_fetch"
    });
    const watchlistId = await getOrCreateDefaultWatchlist(user.id);
    const { error: saveError } = await supabase.from("watchlist_items").upsert(
      {
        watchlist_id: watchlistId,
        asset_id: result.assetId
      },
      {
        onConflict: "watchlist_id,asset_id",
        ignoreDuplicates: true
      }
    );

    if (saveError) {
      throw saveError;
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/assets");
    revalidatePath("/dashboard/watchlist");
    revalidatePath("/dashboard/brief");
    revalidatePath(`/dashboard/assets/${result.symbol}`);

    destination = `/dashboard/assets/${encodeURIComponent(result.symbol)}?message=${encodeMessage(
      `${result.symbol} imported: ${result.reportsUpserted} CFTC reports, latest ${result.latestReportDate ?? "n/a"}.`
    )}`;
  } catch (error) {
    const message = getErrorMessage(error, "Unable to import this CFTC market.");
    console.error("CFTC asset import failed", {
      cftcMarketName: parsed.data.cftcMarketName,
      query: parsed.data.query,
      weeks,
      message
    });
    redirect(withStatus(returnTo, "error", `Import failed: ${message}`));
  }

  redirect(destination);
}
