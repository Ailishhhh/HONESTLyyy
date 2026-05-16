import { createClient } from "@supabase/supabase-js";
import { config } from "./env.js";

// ─── Supabase Admin Client (Backend Only) ─────────────────────────────────────
// Uses service role key — full database access, never expose to frontend

export const supabase = createClient(
  config.supabaseUrl,
  config.supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
