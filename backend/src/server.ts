import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import crypto from "crypto";

import { screenshotService } from "./services/screenshotService.js";
import { geminiService } from "./services/geminiService.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "HONESTLY backend running",
  });
});

app.post("/analyze", async (req, res) => {
  console.log("REQ HIT");

  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        error: "URL is required",
      });
    }

    const cleanUrl = url.startsWith("http")
      ? url
      : `https://${url}`;

    console.log("START SCREENSHOT");

    // REAL SCREENSHOT SERVICE
    const screenshot = await screenshotService.capture(cleanUrl);

    console.log("SCREENSHOT DONE");

    // REAL GEMINI ANALYSIS
    const analysis = await geminiService.analyzeScreenshot(
      screenshot,
      cleanUrl
    );

    console.log("GEMINI DONE");

    // FINAL RESPONSE
    res.json({
      success: true,

      report: {
        id: crypto.randomUUID(),

        ...analysis,

        screenshot:
          `data:image/png;base64,${screenshot.buffer.toString("base64")}`,
      },
    });

  } catch (error) {
    console.error("SERVER ERROR:", error);

    res.status(500).json({
      error: "Analysis failed",
    });
  }
});

app.listen(3001, () => {
  console.log("Server running on port 3001");
});