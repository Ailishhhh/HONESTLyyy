import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import crypto from "crypto";

import { screenshotService } from "./services/screenshotService.js";
import { geminiService } from "./services/geminiService.js";

import { supabase } from "./config/supabase.js";
import { storageService } from "./services/storageService.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "HONESTLY backend running",
  });
});

/* ────────────────────────────────────────────────────────────── */
/* ANALYZE */
/* ────────────────────────────────────────────────────────────── */

app.post("/analyze", async (req, res) => {
  console.log("REQ HIT");

  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        error: "URL is required",
      });
    }

    const authHeader = req.headers.authorization;
    let userId: string | null = null;

    // GET AUTH USER
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");

      const {
        data: { user },
      } = await supabase.auth.getUser(token);

      if (user) {
        userId = user.id;
      }
    }

    const cleanUrl = url.startsWith("http")
      ? url
      : `https://${url}`;

    console.log("START SCREENSHOT");

    // SCREENSHOT
    const screenshot = await screenshotService.capture(cleanUrl);

    console.log("SCREENSHOT DONE");

    // GEMINI ANALYSIS
    const analysis = await geminiService.analyzeScreenshot(
      screenshot,
      cleanUrl
    );

    console.log("GEMINI DONE");

    // REPORT ID
    const reportId = crypto.randomUUID();

    // UPLOAD SCREENSHOT
    console.log("UPLOADING SCREENSHOT");

    const screenshotUrl = await storageService.uploadScreenshot(
      screenshot,
      reportId
    );

    console.log("SCREENSHOT UPLOADED");

    // SAVE TO SUPABASE
    console.log("SAVING REPORT");

    const { error: dbError } = await supabase
      .from("reports")
      .insert({
        id: reportId,

        user_id: userId,

        url: cleanUrl,

        screenshot_url: screenshotUrl,

        scores: analysis.scores,
        issues: analysis.issues,
        strengths: analysis.strengths,

        trust_architecture: analysis.trustArchitecture,
        typography_intelligence: analysis.typographyIntelligence,
        visual_hierarchy: analysis.visualHierarchy,
        premium_perception: analysis.premiumPerception,
        cta_clarity: analysis.ctaClarity,
        cognitive_friction: analysis.cognitiveFriction,
        conversion_confidence: analysis.conversionConfidence,

        executive_verdict: analysis.executiveVerdict,
        psychological_profile: analysis.psychologicalProfile,
        first_impression: analysis.firstImpression,
        priority_fixes: analysis.priorityFixes,

        summary: analysis.summary,
      });

    if (dbError) {
      console.error("SUPABASE ERROR:", dbError);

      return res.status(500).json({
        error: "Failed to save report",
      });
    }

    console.log("REPORT SAVED");

    // RETURN RESPONSE
    res.json({
      success: true,

      report: {
        id: reportId,

        url: cleanUrl,

        screenshotUrl,

        createdAt: new Date().toISOString(),

        userId,

        ...analysis,
      },
    });

  } catch (error) {
    console.error("SERVER ERROR:", error);

    res.status(500).json({
      error: "Analysis failed",
    });
  }
});

/* ────────────────────────────────────────────────────────────── */
/* GET REPORT */
/* ────────────────────────────────────────────────────────────── */

app.get("/report/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        error: "Report not found",
      });
    }

    res.json({
      success: true,

      report: {
        id: data.id,

        url: data.url,

        screenshotUrl: data.screenshot_url,

        scores: data.scores,
        issues: data.issues,
        strengths: data.strengths,

        trustArchitecture: data.trust_architecture,
        typographyIntelligence: data.typography_intelligence,
        visualHierarchy: data.visual_hierarchy,
        premiumPerception: data.premium_perception,
        ctaClarity: data.cta_clarity,
        cognitiveFriction: data.cognitive_friction,
        conversionConfidence: data.conversion_confidence,

        executiveVerdict: data.executive_verdict,
        psychologicalProfile: data.psychological_profile,
        firstImpression: data.first_impression,
        priorityFixes: data.priority_fixes,

        summary: data.summary,

        createdAt: data.created_at,
      },
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch report",
    });
  }
});

/* ────────────────────────────────────────────────────────────── */
/* GET USER HISTORY */
/* ────────────────────────────────────────────────────────────── */

app.get("/api/reports", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const token = authHeader.replace("Bearer ", "");

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({
        error: "Invalid token",
      });
    }

    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);

      return res.status(500).json({
        error: "Failed to fetch reports",
      });
    }

    const reports = data.map((report) => ({
      id: report.id,
      url: report.url,
      screenshotUrl: report.screenshot_url,
      overallScore: report.scores?.overall || 0,
      createdAt: report.created_at,
    }));

    res.json({
      success: true,
      reports,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch history",
    });
  }
});

/* ────────────────────────────────────────────────────────────── */

app.listen(3001, () => {
  console.log("Server running on port 3001");
});