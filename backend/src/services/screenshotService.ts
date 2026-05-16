import { chromium, type Browser, type BrowserContext } from "playwright";
import { logger } from "../utils/logger.js";
import { config } from "../config/env.js";
import type { ScreenshotResult, ScreenshotService } from "../types/index.js";

// ─── Playwright Screenshot Service ───────────────────────────────────────────
// Implements the ScreenshotService interface.
// To swap to kernel.sh: create KernelScreenshotService implementing same interface.
// No frontend code changes required.

export class PlaywrightScreenshotService implements ScreenshotService {
  private browser: Browser | null = null;

  private async getBrowser(): Promise<Browser> {
    if (!this.browser || !this.browser.isConnected()) {
      logger.info("ScreenshotService", "Launching Playwright Chromium browser");
      this.browser = await chromium.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--disable-gpu",
        ],
      });
      logger.info("ScreenshotService", "Chromium browser launched");
    }
    return this.browser;
  }

  async capture(url: string): Promise<ScreenshotResult> {
    let context: BrowserContext | null = null;
    const startTime = Date.now();

    logger.info("ScreenshotService", `Capturing screenshot: ${url}`);

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= config.screenshotMaxRetries; attempt++) {
      try {
        const browser = await this.getBrowser();
        context = await browser.newContext({
          viewport: { width: 1440, height: 900 },
          userAgent:
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) " +
            "AppleWebKit/537.36 (KHTML, like Gecko) " +
            "Chrome/120.0.0.0 Safari/537.36",
          locale: "en-US",
          timezoneId: "America/New_York",
        });

        const page = await context.newPage();

        // Block analytics, ads, and other noise to speed up capture
        await page.route("**/*", (route) => {
          const resourceType = route.request().resourceType();
          const blockedTypes = ["font", "media"];
          const urlToCheck = route.request().url();
          const blockedDomains = [
            "google-analytics.com",
            "googletagmanager.com",
            "facebook.com",
            "twitter.com",
            "doubleclick.net",
            "hotjar.com",
            "intercom.io",
          ];

          if (
            blockedTypes.includes(resourceType) ||
            blockedDomains.some((domain) => urlToCheck.includes(domain))
          ) {
            route.abort();
          } else {
            route.continue();
          }
        });

        // Navigate with timeout
        await page.goto(url, {
          waitUntil: "networkidle",
          timeout: 45000,
        });

        // Wait for visual stability
        await page.waitForTimeout(1500);

        // Dismiss cookie banners heuristically
        try {
          await page.evaluate(() => {
            const selectors = [
              '[id*="cookie"]',
              '[class*="cookie"]',
              '[id*="consent"]',
              '[class*="consent"]',
              '[id*="gdpr"]',
              '[class*="gdpr"]',
              '[id*="banner"]',
            ];
            for (const sel of selectors) {
              const el = document.querySelector(sel);
              if (el && el instanceof HTMLElement) {
                el.style.display = "none";
              }
            }
          });
          await page.waitForTimeout(300);
        } catch {
          // Non-critical — ignore
        }

        // Capture full-page screenshot
        const buffer = await page.screenshot({
          fullPage: false, // viewport screenshot for consistent analysis
          type: "png",
        });

        const elapsed = Date.now() - startTime;
        logger.info("ScreenshotService", `Screenshot captured in ${elapsed}ms (attempt ${attempt})`);

        return {
          buffer: Buffer.from(buffer),
          mimeType: "image/png",
          width: 1440,
          height: 900,
          capturedAt: new Date().toISOString(),
        };
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        logger.warn(
          "ScreenshotService",
          `Screenshot attempt ${attempt} failed: ${lastError.message}`
        );

        // Reset browser on failure
        if (this.browser?.isConnected()) {
          try { await this.browser.close(); } catch { /* ignore */ }
          this.browser = null;
        }

        if (attempt < config.screenshotMaxRetries) {
          await new Promise((r) => setTimeout(r, 2000 * attempt));
        }
      } finally {
        if (context) {
          try { await context.close(); } catch { /* ignore */ }
        }
      }
    }

    throw new Error(
      `Screenshot capture failed after ${config.screenshotMaxRetries} attempts: ${lastError?.message}`
    );
  }

  async close(): Promise<void> {
    if (this.browser?.isConnected()) {
      await this.browser.close();
      this.browser = null;
      logger.info("ScreenshotService", "Browser closed");
    }
  }
}

// ─── Singleton instance ───────────────────────────────────────────────────────
// Reuses the same browser across requests for performance

export const screenshotService = new PlaywrightScreenshotService();
