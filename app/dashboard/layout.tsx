import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) {
    redirect(
      `/auth/login?error=${encodeURIComponent("Configure Supabase environment variables before using the dashboard.")}`
    );
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <DashboardShell email={user.email ?? "No email"} profile={(profile as Profile | null) ?? null}>
      {children}
    </DashboardShell>
  );
}
