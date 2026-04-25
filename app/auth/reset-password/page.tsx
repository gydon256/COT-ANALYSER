import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { FormField } from "@/components/ui/FormField";
import { SetupNotice } from "@/components/ui/SetupNotice";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { requestPasswordResetAction, updatePasswordAction } from "@/lib/actions/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const mode = firstParam(params.mode);
  const isUpdateMode = mode === "update";

  return (
    <AuthCard
      title={isUpdateMode ? "Set new password" : "Reset password"}
      subtitle={
        isUpdateMode
          ? "Enter a new password for your COT Analyser account."
          : "Send a secure password reset link to your email address."
      }
      footer={
        <span className="text-slate-600">
          Remembered your password?{" "}
          <Link className="font-semibold text-teal-800 hover:text-teal-900" href="/auth/login">
            Log in
          </Link>
        </span>
      }
    >
      <div className="grid gap-4">
        {!isSupabaseConfigured() ? <SetupNotice /> : null}
        <StatusMessage error={params.error} message={params.message} />
        {isUpdateMode ? (
          <form action={updatePasswordAction} className="grid gap-4">
            <FormField
              autoComplete="new-password"
              label="New password"
              name="password"
              required
              type="password"
            />
            <FormField
              autoComplete="new-password"
              label="Confirm password"
              name="confirmPassword"
              required
              type="password"
            />
            <SubmitButton pendingLabel="Updating password...">Update password</SubmitButton>
          </form>
        ) : (
          <form action={requestPasswordResetAction} className="grid gap-4">
            <FormField autoComplete="email" label="Email" name="email" required type="email" />
            <SubmitButton pendingLabel="Sending reset link...">Send reset link</SubmitButton>
          </form>
        )}
      </div>
    </AuthCard>
  );
}
