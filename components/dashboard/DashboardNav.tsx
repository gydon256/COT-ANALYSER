"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, DatabaseZap, FileText, LayoutDashboard, Search, Star, User } from "lucide-react";
import { clsx } from "clsx";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/brief", label: "Weekly Brief", icon: FileText },
  { href: "/dashboard/assets", label: "Assets", icon: Search },
  { href: "/dashboard/watchlist", label: "Watchlist", icon: Star },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/admin", label: "Admin", icon: DatabaseZap }
];

export function DashboardBrand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2">
      <span className="flex size-10 items-center justify-center rounded-md bg-teal-700 text-white">
        <BarChart3 size={22} aria-hidden="true" />
      </span>
      <span className="text-lg font-bold text-slate-950">COT Analyser</span>
    </Link>
  );
}

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="grid gap-1">
      {links.map((link) => {
        const Icon = link.icon;
        const active = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));

        return (
          <Link
            key={link.href}
            href={link.href}
            className={clsx(
              "flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition",
              active
                ? "bg-teal-50 text-teal-900"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            )}
          >
            <Icon size={18} aria-hidden="true" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
