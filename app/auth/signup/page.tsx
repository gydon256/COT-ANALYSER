import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { FormField } from "@/components/ui/FormField";
import { SetupNotice } from "@/components/ui/SetupNotice";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { signUpAction } from "@/lib/actions/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SignupPage({ searchParams }: PageProps) {
  const params = await searchParams;

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
      title="Create account"
      subtitle="Create a free COT Analyser account with email and password."
      footer={
        <span className="text-slate-600">
          Already have an account?{" "}
          <Link className="font-semibold text-teal-800 hover:text-teal-900" href="/auth/login">
            Log in
          </Link>
        </span>
      }
    >
      <div className="grid gap-4">
        {!isSupabaseConfigured() ? <SetupNotice /> : null}
        <StatusMessage error={params.error} message={params.message} />
        <form action={signUpAction} className="grid gap-4">
          <FormField autoComplete="name" label="Full name" name="fullName" type="text" />
          <FormField autoComplete="email" label="Email" name="email" required type="email" />
          <FormField
            autoComplete="new-password"
            hint="Use at least 8 characters."
            label="Password"
            name="password"
            required
            type="password"
          />
          <SubmitButton pendingLabel="Creating account...">Create account</SubmitButton>
        </form>
      </div>
    </AuthCard>
  );
}
