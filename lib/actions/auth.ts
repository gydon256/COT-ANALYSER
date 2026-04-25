"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

const emailSchema = z.string().trim().email("Enter a valid email address.");
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(72, "Password is too long.");

const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: z.string().trim().max(80).optional()
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password."),
  next: z.string().optional()
});

const resetPasswordSchema = z.object({
  email: emailSchema
});

const updatePasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password.")
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"]
  });

function encodeMessage(message: string) {
  return encodeURIComponent(message);
}

function safeNextPath(value: FormDataEntryValue | null | undefined) {
  const next = typeof value === "string" ? value : "";

  if (next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }

  return "/dashboard";
}

async function getOrigin() {
  const headerStore = await headers();
  return headerStore.get("origin") ?? "http://localhost:3000";
}

export async function signUpAction(formData: FormData) {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName") || undefined
  });

  if (!parsed.success) {
    redirect(`/auth/signup?error=${encodeMessage(parsed.error.issues[0]?.message ?? "Invalid signup details.")}`);
  }

  if (!isSupabaseConfigured()) {
    redirect(
      `/auth/signup?error=${encodeMessage(
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local, then restart the dev server."
      )}`
    );
  }

  const supabase = await createClient();
  const origin = await getOrigin();
  const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent("/dashboard")}`;

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName ?? ""
      },
      emailRedirectTo: redirectTo
    }
  });

  if (error) {
    redirect(`/auth/signup?error=${encodeMessage(error.message)}`);
  }

  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/dashboard");
  }

  redirect(
    `/auth/login?message=${encodeMessage("Check your email to confirm your account, then log in.")}`
  );
}

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") || undefined
  });

  const next = safeNextPath(formData.get("next"));

  if (!parsed.success) {
    redirect(
      `/auth/login?next=${encodeURIComponent(next)}&error=${encodeMessage(
        parsed.error.issues[0]?.message ?? "Invalid login details."
      )}`
    );
  }

  if (!isSupabaseConfigured()) {
    redirect(
      `/auth/login?next=${encodeURIComponent(next)}&error=${encodeMessage(
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local, then restart the dev server."
      )}`
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password
  });

  if (error) {
    redirect(`/auth/login?next=${encodeURIComponent(next)}&error=${encodeMessage(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect(next);
}

export async function logoutAction() {
  if (!isSupabaseConfigured()) {
    redirect("/auth/login");
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/auth/login");
}

export async function requestPasswordResetAction(formData: FormData) {
  const parsed = resetPasswordSchema.safeParse({
    email: formData.get("email")
  });

  if (!parsed.success) {
    redirect(
      `/auth/reset-password?error=${encodeMessage(
        parsed.error.issues[0]?.message ?? "Enter a valid email address."
      )}`
    );
  }

  if (!isSupabaseConfigured()) {
    redirect(
      `/auth/reset-password?error=${encodeMessage(
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local, then restart the dev server."
      )}`
    );
  }

  const supabase = await createClient();
  const origin = await getOrigin();
  const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(
    "/auth/reset-password?mode=update"
  )}`;

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo
  });

  if (error) {
    redirect(`/auth/reset-password?error=${encodeMessage(error.message)}`);
  }

  redirect(
    `/auth/reset-password?message=${encodeMessage("Password reset link sent. Check your email.")}`
  );
}

export async function updatePasswordAction(formData: FormData) {
  const parsed = updatePasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword")
  });

  if (!parsed.success) {
    redirect(
      `/auth/reset-password?mode=update&error=${encodeMessage(
        parsed.error.issues[0]?.message ?? "Invalid password."
      )}`
    );
  }

  if (!isSupabaseConfigured()) {
    redirect(
      `/auth/reset-password?mode=update&error=${encodeMessage(
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local, then restart the dev server."
      )}`
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password
  });

  if (error) {
    redirect(`/auth/reset-password?mode=update&error=${encodeMessage(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/dashboard/profile?message=Password updated.");
}
