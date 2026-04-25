"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";
import { requireSupabaseConfig } from "@/lib/supabase/config";

export function createClient() {
  const { url, anonKey } = requireSupabaseConfig();

  return createBrowserClient<Database>(url, anonKey);
}
