import type { ReactNode } from "react";
import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";

type AuthCardProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 flex items-center gap-3 text-slate-950">
          <span className="flex size-10 items-center justify-center rounded-md bg-teal-700 text-white">
            <BarChart3 size={22} aria-hidden="true" />
          </span>
          <span className="text-lg font-bold">COT Analyser</span>
        </Link>

        <Card>
          <CardBody className="grid gap-6">
            <div className="grid gap-2">
              <h1 className="text-2xl font-bold text-slate-950">{title}</h1>
              <p className="text-sm leading-6 text-slate-600">{subtitle}</p>
            </div>
            {children}
            {footer ? <div className="border-t border-slate-200 pt-4 text-sm">{footer}</div> : null}
          </CardBody>
        </Card>
      </div>
    </main>
  );
}
