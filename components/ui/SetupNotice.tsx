import { Card, CardBody } from "@/components/ui/Card";

export function SetupNotice() {
  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardBody className="text-sm text-amber-950">
        Supabase is not configured yet. Create `.env.local` from `.env.example`, then add
        `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
      </CardBody>
    </Card>
  );
}
