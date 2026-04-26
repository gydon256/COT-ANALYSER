import { NextResponse } from "next/server";
import { buildMarketOverviewRows, marketOverviewToCsv } from "@/lib/cot/marketOverview";
import { createClient } from "@/lib/supabase/server";
import type { Asset, CotReport } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const [{ data: assets }, { data: reports }] = await Promise.all([
    supabase.from("assets").select("*").order("symbol", { ascending: true }),
    supabase.from("cot_reports").select("*").order("report_date", { ascending: true })
  ]);

  const rows = buildMarketOverviewRows((assets ?? []) as Asset[], (reports ?? []) as CotReport[]);
  const csv = marketOverviewToCsv(rows);

  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="cot-market-overview-${new Date().toISOString().slice(0, 10)}.csv"`
    }
  });
}
