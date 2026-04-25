import Link from "next/link";
import { redirect } from "next/navigation";
import { BarChart3, Database, LineChart, LockKeyhole } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { SetupNotice } from "@/components/ui/SetupNotice";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function HomePage() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (user) {
      redirect("/dashboard");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-md bg-teal-700 text-white">
            <BarChart3 size={22} aria-hidden="true" />
          </span>
          <span className="text-lg font-bold text-slate-950">COT Analyser</span>
        </Link>
        <div className="flex items-center gap-2">
          <ButtonLink href="/auth/login" variant="ghost">
            Log in
          </ButtonLink>
          <ButtonLink href="/auth/signup">Create account</ButtonLink>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 md:grid-cols-[1fr_420px] md:items-center">
        <div className="grid gap-6">
          {!isSupabaseConfigured() ? <SetupNotice /> : null}
          <div className="grid gap-4">
            <p className="text-sm font-semibold uppercase text-teal-800">
              Free COT research workspace
            </p>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight text-slate-950 md:text-6xl">
              Track CFTC positioning, save markets, and build a cleaner trade bias.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
              A trader-focused MVP using Supabase Auth, PostgreSQL, and public CFTC data
              preparation. Start with seeded sample markets and connect real public files later.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/auth/signup">Start free</ButtonLink>
            <ButtonLink href="/auth/login" variant="secondary">
              Log in
            </ButtonLink>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4">
            {[
              {
                icon: LockKeyhole,
                title: "Supabase Auth",
                body: "Email signup, login, logout, password reset, and session-protected dashboards."
              },
              {
                icon: Database,
                title: "PostgreSQL + RLS",
                body: "Watchlists and profile data are scoped to each authenticated user."
              },
              {
                icon: LineChart,
                title: "COT positioning",
                body: "Seeded report data renders market summaries and positioning charts."
              }
            ].map((item) => (
              <div key={item.title} className="flex gap-3 rounded-md border border-slate-200 p-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-teal-800">
                  <item.icon size={20} aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-semibold text-slate-950">{item.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
