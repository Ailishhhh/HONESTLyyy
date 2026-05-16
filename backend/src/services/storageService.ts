import { supabase } from "../config/supabase.js";
import { config } from "../config/env.js";
import { logger } from "../utils/logger.js";
import type { ScreenshotResult } from "../types/index.js";
import { v4 as uuidv4 } from "uuid";

// ─── Storage Service ──────────────────────────────────────────────────────────
// Handles screenshot upload to Supabase Storage

export class StorageService {
  async uploadScreenshot(
    screenshot: ScreenshotResult,
    reportId: string
  ): Promise<string | null> {
    const filename = `${reportId}/${uuidv4()}.png`;

    logger.info("StorageService", `Uploading screenshot: ${filename}`);

    try {
      const { error } = await supabase.storage
        .from(config.screenshotBucket)
        .upload(filename, screenshot.buffer, {
          contentType: screenshot.mimeType,
          upsert: false,
        });

      if (error) {
        logger.warn("StorageService", `Upload failed: ${error.message}`);
        return null;
      }

      const { data } = supabase.storage
        .from(config.screenshotBucket)
        .getPublicUrl(filename);

      logger.info("StorageService", `Screenshot uploaded: ${data.publicUrl}`);
      return data.publicUrl;
    } catch (err) {
      logger.warn("StorageService", "Screenshot upload failed", err);
      return null; // Non-critical — report continues without screenshot
    }
  }

  async deleteScreenshot(screenshotUrl: string): Promise<void> {
    try {
      // Extract path from URL
      const url = new URL(screenshotUrl);
      const pathParts = url.pathname.split(`/${config.screenshotBucket}/`);
      if (pathParts.length < 2) return;

      const filePath = pathParts[1];
      await supabase.storage.from(config.screenshotBucket).remove([filePath]);
      logger.info("StorageService", `Screenshot deleted: ${filePath}`);
    } catch (err) {
      logger.warn("StorageService", "Failed to delete screenshot", err);
    }
  }
}

export const storageService = new StorageService();
