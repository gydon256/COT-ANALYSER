"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const profileSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters.")
    .max(30, "Username must be 30 characters or fewer.")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only use letters, numbers, and underscores."),
  fullName: z.string().trim().max(80, "Full name must be 80 characters or fewer.").optional()
});

function encodeMessage(message: string) {
  return encodeURIComponent(message);
}

export async function updateProfileAction(formData: FormData) {
  const parsed = profileSchema.safeParse({
    username: formData.get("username"),
    fullName: formData.get("fullName") || undefined
  });

  if (!parsed.success) {
    redirect(
      `/dashboard/profile?error=${encodeMessage(
        parsed.error.issues[0]?.message ?? "Invalid profile details."
      )}`
    );
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      username: parsed.data.username.toLowerCase(),
      full_name: parsed.data.fullName ?? null
    })
    .eq("id", user.id);

  if (error) {
    redirect(`/dashboard/profile?error=${encodeMessage(error.message)}`);
  }

  revalidatePath("/dashboard", "layout");
  redirect(`/dashboard/profile?message=${encodeMessage("Profile updated.")}`);
}
