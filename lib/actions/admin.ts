"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ingestKnownCftcAssets } from "@/lib/cftc/ingest";
import { createClient } from "@/lib/supabase/server";

const ingestionSchema = z.object({
  weeks: z.coerce.number().int().refine((value) => value === 52 || value === 126).default(52)
});

function encodeMessage(message: string) {
  return encodeURIComponent(message);
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error || profile?.role !== "admin") {
    redirect(`/dashboard/admin?error=${encodeMessage("Admin access is required.")}`);
  }

  return user;
}

export async function runCftcIngestionAction(formData: FormData) {
  const parsed = ingestionSchema.safeParse({
    weeks: formData.get("weeks") ?? 52
  });

  if (!parsed.success) {
    redirect(`/dashboard/admin?error=${encodeMessage("Choose 52 weeks or 126 weeks.")}`);
  }

  const user = await requireAdmin();
  let destination = "/dashboard/admin";

  try {
    const result = await ingestKnownCftcAssets({
      weeks: parsed.data.weeks,
      createdBy: user.id
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/assets");
    revalidatePath("/dashboard/watchlist");
    revalidatePath("/dashboard/brief");
    revalidatePath("/dashboard/admin");

    const status = result.errors.length ? "completed with warnings" : "completed";
    destination = `/dashboard/admin?message=${encodeMessage(
      `CFTC ingestion ${status}: ${result.reportsUpserted} reports across ${result.assetsChecked} assets.`
    )}`;
  } catch (error) {
    const message = error instanceof Error ? error.message : "CFTC ingestion failed.";
    redirect(`/dashboard/admin?error=${encodeMessage(message)}`);
  }

  redirect(destination);
}
