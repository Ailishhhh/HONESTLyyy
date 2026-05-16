// ─── Logger ───────────────────────────────────────────────────────────────────
// Simple structured logger for the backend

type LogLevel = "info" | "warn" | "error" | "debug";

const LEVEL_COLORS: Record<LogLevel, string> = {
  info: "\x1b[36m",   // cyan
  warn: "\x1b[33m",   // yellow
  error: "\x1b[31m",  // red
  debug: "\x1b[90m",  // gray
};
const RESET = "\x1b[0m";

function log(level: LogLevel, context: string, message: string, meta?: unknown): void {
  const timestamp = new Date().toISOString();
  const color = LEVEL_COLORS[level];
  const prefix = `${color}[${level.toUpperCase()}]${RESET} [${timestamp}] [${context}]`;

  if (meta !== undefined) {
    console.log(`${prefix} ${message}`, meta);
  } else {
    console.log(`${prefix} ${message}`);
  }
}

export const logger = {
  info: (context: string, message: string, meta?: unknown) => log("info", context, message, meta),
  warn: (context: string, message: string, meta?: unknown) => log("warn", context, message, meta),
  error: (context: string, message: string, meta?: unknown) => log("error", context, message, meta),
  debug: (context: string, message: string, meta?: unknown) => {
    if (process.env.NODE_ENV !== "production") {
      log("debug", context, message, meta);
    }
  },
};
