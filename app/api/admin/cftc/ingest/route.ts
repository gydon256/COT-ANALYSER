import { NextResponse } from "next/server";
import { validateFetchWeeks } from "@/lib/cftc/allowedMarkets";
import { ingestKnownCftcAssets } from "@/lib/cftc/ingest";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const weeks = validateFetchWeeks(body.weeks);
  const result = await ingestKnownCftcAssets({
    weeks,
    createdBy: user.id
  });

  return NextResponse.json(result);
}
