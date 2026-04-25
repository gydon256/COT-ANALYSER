"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ingestKnownCftcAssets } from "@/lib/cftc/ingest";
import { createClient } from "@/lib/supabase/server";

const ingestionSchema = z.object({
  weeks: z.coerce.number().int().min(4).max(1040).default(260)
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
    weeks: formData.get("weeks") ?? 260
  });

  if (!parsed.success) {
    redirect(`/dashboard/admin?error=${encodeMessage("Choose a range between 4 and 1040 weeks.")}`);
  }

  const user = await requireAdmin();

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
    redirect(
      `/dashboard/admin?message=${encodeMessage(
        `CFTC ingestion ${status}: ${result.reportsUpserted} reports across ${result.assetsChecked} assets.`
      )}`
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "CFTC ingestion failed.";
    redirect(`/dashboard/admin?error=${encodeMessage(message)}`);
  }
}
