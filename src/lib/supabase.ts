import { createClient } from "@supabase/supabase-js";
import env from "@/config/env";

// ─── Supabase Client (Frontend) ───────────────────────────────────────────────
// Uses only the public anon key — safe for browser
// Service role key lives exclusively in the backend

if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
  console.warn(
    "[HONESTLY?] Supabase env vars not set. Auth features will be disabled. " +
    "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file."
  );
}

export const supabase = createClient(
  env.SUPABASE_URL || "https://placeholder.supabase.co",
  env.SUPABASE_ANON_KEY || "placeholder-anon-key",
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

export type SupabaseClient = typeof supabase;
