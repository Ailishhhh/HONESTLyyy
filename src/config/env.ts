// ─── Environment Configuration ────────────────────────────────────────────────
// All environment variables consumed by the frontend

const env = {
  // Backend API base URL — set VITE_API_URL in .env
  API_URL: import.meta.env.VITE_API_URL || "http://localhost:3001",

  // Supabase — public keys only, safe for frontend
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || "",
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
};

export default env;
