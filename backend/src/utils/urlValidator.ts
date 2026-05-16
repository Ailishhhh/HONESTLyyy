import { z } from "zod";

// ─── URL Validator ─────────────────────────────────────────────────────────────

const BLOCKED_HOSTS = [
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "169.254.169.254", // AWS metadata
  "metadata.google.internal",
];

const URL_SCHEMA = z.object({
  url: z
    .string()
    .min(1, "URL is required")
    .url("Must be a valid URL")
    .refine((url) => {
      try {
        const parsed = new URL(url);
        return parsed.protocol === "https:" || parsed.protocol === "http:";
      } catch {
        return false;
      }
    }, "URL must use http or https protocol"),
});

export interface UrlValidationResult {
  valid: boolean;
  normalizedUrl?: string;
  error?: string;
}

export function validateUrl(rawUrl: string): UrlValidationResult {
  try {
    const result = URL_SCHEMA.safeParse({ url: rawUrl });

    if (!result.success) {
      return {
        valid: false,
        error: result.error.issues[0]?.message || "Invalid URL",
      };
    }

    const parsed = new URL(rawUrl);

    // Block SSRF targets
    const hostname = parsed.hostname.toLowerCase();
    if (BLOCKED_HOSTS.some((blocked) => hostname === blocked || hostname.endsWith(`.${blocked}`))) {
      return {
        valid: false,
        error: "URL hostname is not allowed",
      };
    }

    // Block private IP ranges
    if (isPrivateIp(hostname)) {
      return {
        valid: false,
        error: "URL must point to a public internet address",
      };
    }

    return {
      valid: true,
      normalizedUrl: rawUrl,
    };
  } catch (err) {
    return {
      valid: false,
      error: "Failed to parse URL",
    };
  }
}

function isPrivateIp(hostname: string): boolean {
  // Basic private IP detection
  const privateRanges = [
    /^10\./,
    /^172\.(1[6-9]|2\d|3[01])\./,
    /^192\.168\./,
    /^fc00:/,
    /^fe80:/,
  ];
  return privateRanges.some((range) => range.test(hostname));
}
