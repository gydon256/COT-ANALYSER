import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { FormField } from "@/components/ui/FormField";
import { SetupNotice } from "@/components/ui/SetupNotice";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { loginAction } from "@/lib/actions/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const next = firstParam(params.next) ?? "/dashboard";

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
    <AuthCard
      title="Log in"
      subtitle="Access your saved markets, watchlists, and COT positioning dashboard."
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2 text-slate-600">
          <span>
            New here?{" "}
            <Link className="font-semibold text-teal-800 hover:text-teal-900" href="/auth/signup">
              Create account
            </Link>
          </span>
          <Link className="font-semibold text-teal-800 hover:text-teal-900" href="/auth/reset-password">
            Reset password
          </Link>
        </div>
      }
    >
      <div className="grid gap-4">
        {!isSupabaseConfigured() ? <SetupNotice /> : null}
        <StatusMessage error={params.error} message={params.message} />
        <form action={loginAction} className="grid gap-4">
          <input name="next" type="hidden" value={next} />
          <FormField autoComplete="email" label="Email" name="email" required type="email" />
          <FormField
            autoComplete="current-password"
            label="Password"
            name="password"
            required
            type="password"
          />
          <SubmitButton pendingLabel="Logging in...">Log in</SubmitButton>
        </form>
      </div>
    </AuthCard>
  );
}
