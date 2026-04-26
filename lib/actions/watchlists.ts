"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const assetIdSchema = z.coerce.number().int().positive();
const itemIdSchema = z.coerce.number().int().positive();
const workflowSchema = z.object({
  itemId: z.coerce.number().int().positive(),
  biasLabel: z.enum(["bullish", "bearish", "neutral", "waiting"]).default("waiting"),
  notes: z.string().max(4000).default(""),
  returnTo: z.string().optional()
});

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

export async function updateWatchlistItemWorkflowAction(formData: FormData) {
  const parsed = workflowSchema.safeParse({
    itemId: formData.get("itemId"),
    biasLabel: formData.get("biasLabel") ?? "waiting",
    notes: formData.get("notes") ?? "",
    returnTo: formData.get("returnTo") ?? "/dashboard/watchlist"
  });

  const returnTo = safeReturnPath(formData.get("returnTo"));

  if (!parsed.success) {
    redirect(`${returnTo}?error=${encodeMessage("Invalid workflow details.")}`);
  }

  const { supabase } = await requireUser();
  const checklist = {
    bias: formData.get("check_bias") === "on",
    level: formData.get("check_level") === "on",
    trigger: formData.get("check_trigger") === "on",
    risk: formData.get("check_risk") === "on"
  };

  const { data: item, error: itemError } = await supabase
    .from("watchlist_items")
    .select("id, asset_id, assets(symbol)")
    .eq("id", parsed.data.itemId)
    .maybeSingle();

  if (itemError || !item) {
    redirect(`${returnTo}?error=${encodeMessage("Watchlist item was not found.")}`);
  }

  const { error } = await supabase
    .from("watchlist_items")
    .update({
      bias_label: parsed.data.biasLabel,
      notes: parsed.data.notes.trim(),
      checklist
    })
    .eq("id", parsed.data.itemId);

  if (error) {
    redirect(`${returnTo}?error=${encodeMessage(error.message)}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/watchlist");
  revalidatePath("/dashboard/brief");

  const symbol = Array.isArray(item.assets) ? item.assets[0]?.symbol : item.assets?.symbol;
  if (symbol) {
    revalidatePath(`/dashboard/assets/${symbol}`);
  }

  redirect(`${returnTo}?message=${encodeMessage("Trade workflow saved.")}`);
}
