"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const assetIdSchema = z.coerce.number().int().positive();
const itemIdSchema = z.coerce.number().int().positive();

function encodeMessage(message: string) {
  return encodeURIComponent(message);
}

function safeReturnPath(value: FormDataEntryValue | null) {
  const path = typeof value === "string" ? value : "/dashboard/assets";
  return path.startsWith("/") && !path.startsWith("//") ? path : "/dashboard/assets";
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

export async function saveAssetToWatchlistAction(formData: FormData) {
  const returnTo = safeReturnPath(formData.get("returnTo"));
  const parsed = assetIdSchema.safeParse(formData.get("assetId"));

  if (!parsed.success) {
    redirect(`${returnTo}?error=${encodeMessage("Invalid asset selected.")}`);
  }

  const { supabase, user } = await requireUser();

  try {
    const watchlistId = await getOrCreateDefaultWatchlist(user.id);
    const { error } = await supabase.from("watchlist_items").upsert(
      {
        watchlist_id: watchlistId,
        asset_id: parsed.data
      },
      {
        onConflict: "watchlist_id,asset_id",
        ignoreDuplicates: true
      }
    );

    if (error) {
      throw error;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save asset.";
    redirect(`${returnTo}?error=${encodeMessage(message)}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/assets");
  revalidatePath("/dashboard/watchlist");
  redirect(`${returnTo}?message=${encodeMessage("Asset saved to watchlist.")}`);
}

export async function removeWatchlistItemAction(formData: FormData) {
  const parsed = itemIdSchema.safeParse(formData.get("itemId"));

  if (!parsed.success) {
    redirect(`/dashboard/watchlist?error=${encodeMessage("Invalid watchlist item.")}`);
  }

  const { supabase } = await requireUser();
  const { error } = await supabase.from("watchlist_items").delete().eq("id", parsed.data);

  if (error) {
    redirect(`/dashboard/watchlist?error=${encodeMessage(error.message)}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/watchlist");
  redirect(`/dashboard/watchlist?message=${encodeMessage("Asset removed from watchlist.")}`);
}
