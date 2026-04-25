import type { ReactNode } from "react";
import { Card, CardBody } from "@/components/ui/Card";

type StatCardProps = {
  label: string;
  value: ReactNode;
  detail?: string;
};

export function StatCard({ label, value, detail }: StatCardProps) {
  return (
    <Card>
      <CardBody>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
        {detail ? <p className="mt-2 text-sm text-slate-600">{detail}</p> : null}
      </CardBody>
    </Card>
  );
}
