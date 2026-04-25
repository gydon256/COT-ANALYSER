import { createServiceRoleClient } from "@/lib/supabase/server";
import type { ParsedCotReport } from "@/lib/cftc/types";

export async function upsertCotReports(reports: ParsedCotReport[]) {
  if (!reports.length) {
    return { inserted: 0 };
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("cot_reports").upsert(reports, {
    onConflict: "asset_id,report_date"
  });

  if (error) {
    throw error;
  }

  return { inserted: reports.length };
}
