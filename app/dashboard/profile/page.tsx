import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { updateProfileAction } from "@/lib/actions/profile";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProfilePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id ?? "")
    .maybeSingle();

  const profile = profileData as Profile | null;

  return (
    <>
      <PageHeader
        title="Profile"
        description="Manage your public account details. Authentication and password storage are handled by Supabase Auth."
      />

      <StatusMessage error={params.error} message={params.message} />

      <section className="grid gap-5 lg:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-bold text-slate-950">Account details</h2>
            <p className="mt-1 text-sm text-slate-600">Update your trader profile details.</p>
          </CardHeader>
          <CardBody>
            <form action={updateProfileAction} className="grid gap-4">
              <FormField
                defaultValue={profile?.username ?? ""}
                hint="Letters, numbers, and underscores only."
                label="Username"
                name="username"
                required
                type="text"
              />
              <FormField
                defaultValue={profile?.full_name ?? ""}
                label="Full name"
                name="fullName"
                type="text"
              />
              <SubmitButton className="w-full sm:w-auto" pendingLabel="Saving...">
                Save profile
              </SubmitButton>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-bold text-slate-950">Current account</h2>
          </CardHeader>
          <CardBody className="grid gap-3 text-sm">
            <Detail label="Email" value={user?.email ?? "n/a"} />
            <Detail label="Username" value={profile?.username ?? "Not set"} />
            <Detail label="Full name" value={profile?.full_name ?? "Not set"} />
            <Detail label="Role" value={profile?.role ?? "user"} />
            <Detail label="Plan" value={profile?.plan ?? "free"} />
          </CardBody>
        </Card>
      </section>
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-slate-200 px-3 py-2">
      <span className="text-slate-500">{label}</span>
      <span className="max-w-[240px] truncate font-semibold text-slate-950">{value}</span>
    </div>
  );
}
