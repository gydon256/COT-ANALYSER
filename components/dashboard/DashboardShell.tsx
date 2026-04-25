import type { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { DashboardBrand, DashboardNav } from "@/components/dashboard/DashboardNav";
import { Button } from "@/components/ui/Button";
import { logoutAction } from "@/lib/actions/auth";
import type { Profile } from "@/lib/types";

type DashboardShellProps = {
  children: ReactNode;
  email: string;
  profile: Profile | null;
};

export function DashboardShell({ children, email, profile }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white p-4 md:grid md:grid-rows-[auto_1fr_auto]">
        <DashboardBrand />
        <div className="mt-8">
          <DashboardNav />
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="truncate text-sm font-semibold text-slate-950">
            {profile?.full_name || profile?.username || email}
          </p>
          <p className="mt-1 truncate text-xs text-slate-500">{email}</p>
          <p className="mt-3 inline-flex rounded-md bg-white px-2 py-1 text-xs font-semibold uppercase text-teal-800">
            {profile?.plan ?? "free"} plan
          </p>
          <form action={logoutAction} className="mt-3">
            <Button className="w-full" type="submit" variant="secondary">
              <LogOut size={16} aria-hidden="true" />
              Log out
            </Button>
          </form>
        </div>
      </aside>

      <div className="md:pl-72">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:hidden">
          <div className="flex items-center justify-between gap-3">
            <DashboardBrand />
            <form action={logoutAction}>
              <Button aria-label="Log out" type="submit" variant="ghost">
                <LogOut size={18} aria-hidden="true" />
              </Button>
            </form>
          </div>
          <div className="mt-3 overflow-x-auto pb-1">
            <div className="min-w-max">
              <DashboardNav />
            </div>
          </div>
        </header>

        <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
