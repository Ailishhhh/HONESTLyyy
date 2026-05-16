import "dotenv/config";

// ─── Backend Environment Config ────────────────────────────────────────────────
// Validates all required environment variables at startup

interface Config {
  port: number;
  nodeEnv: string;
  allowedOrigins: string[];
  geminiApiKey: string;
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  screenshotBucket: string;
  screenshotMaxRetries: number;
}

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`[Config] Missing required environment variable: ${key}`);
  }
  return value;
}

function getEnv(key: string, fallback: string): string {
  return process.env[key] || fallback;
}

export const config: Config = {
  port: parseInt(getEnv("PORT", "3001"), 10),
  nodeEnv: getEnv("NODE_ENV", "development"),
  allowedOrigins: getEnv("ALLOWED_ORIGINS", "http://localhost:5173")
    .split(",")
    .map((o) => o.trim()),
  geminiApiKey: requireEnv("GEMINI_API_KEY"),
  supabaseUrl: requireEnv("SUPABASE_URL"),
  supabaseServiceRoleKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  screenshotBucket: getEnv("SCREENSHOT_BUCKET", "screenshots"),
  screenshotMaxRetries: parseInt(getEnv("SCREENSHOT_MAX_RETRIES", "2"), 10),
};
