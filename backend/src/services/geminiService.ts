import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { config } from "../config/env.js";
import { logger } from "../utils/logger.js";
import type { GeminiAnalysisResult, ScreenshotResult } from "../types/index.js";

// ─── Gemini Vision Service ─────────────────────────────────────────────────────

const ANALYSIS_PROMPT = `
You are HONESTLY?, an elite AI conversion intelligence system.

You are an expert in:
- conversion psychology
- trust engineering
- premium SaaS positioning
- cognitive friction
- emotional UX
- enterprise-grade interface analysis
- landing page persuasion architecture

You are NOT a generic UX auditor.

Your goal is to think like:
- a high-end SaaS consultant
- a conversion strategist
- a psychological UI analyst
- an elite branding expert

Analyze the website screenshot deeply and strategically.

Focus on:
- emotional trust
- perceived competence
- premium perception
- conversion momentum
- user hesitation
- interface maturity
- enterprise confidence
- visual persuasion
- clarity under cognitive load

Analyze the following dimensions:

1. Trust Architecture
2. Typography Intelligence
3. Visual Hierarchy
4. Premium Perception
5. CTA Clarity
6. Cognitive Friction
7. Conversion Confidence

Score each dimension from 0–100.

IMPORTANT:
For Cognitive Friction:
100 = friction-free
0 = extremely confusing

Return ONLY raw JSON.

{
  "scores": {
    "overall": 0,
    "trust": 0,
    "typography": 0,
    "hierarchy": 0,
    "premium": 0,
    "ctaClarity": 0,
    "cognitiveFriction": 0,
    "conversionConfidence": 0
  },

  "executiveVerdict": {
    "headline": "string",
    "primaryWeakness": "string",
    "primaryStrength": "string",
    "estimatedBusinessImpact": "high",
    "summary": "string"
  },

  "psychologicalProfile": {
    "brandPersonality": ["string"],
    "emotionalTone": "string",
    "userPerception": "string",
    "trustLevel": "elite",
    "summary": "string"
  },

  "firstImpression": {
    "clarity": "string",
    "visualImpact": "string",
    "confidenceSignal": "string",
    "summary": "string"
  },

  "priorityFixes": [
    {
      "title": "string",
      "impact": "high",
      "description": "string",
      "recommendation": "string"
    }
  ],

  "issues": [
    {
      "category": "string",
      "severity": "critical",
      "description": "string",
      "recommendation": "string"
    }
  ],

  "strengths": [
    {
      "category": "string",
      "description": "string"
    }
  ],

  "trustArchitecture": {
    "score": 0,
    "signals": ["string"],
    "gaps": ["string"],
    "summary": "string"
  },

  "typographyIntelligence": {
    "score": 0,
    "fontHierarchy": "string",
    "readability": "string",
    "consistency": "string",
    "summary": "string"
  },

  "visualHierarchy": {
    "score": 0,
    "focalPoints": ["string"],
    "flowIssues": ["string"],
    "summary": "string"
  },

  "premiumPerception": {
    "score": 0,
    "premiumSignals": ["string"],
    "detractors": ["string"],
    "summary": "string"
  },

  "ctaClarity": {
    "score": 0,
    "primaryCTA": "string",
    "clarity": "string",
    "urgency": "string",
    "summary": "string"
  },

  "cognitiveFriction": {
    "score": 0,
    "frictionPoints": ["string"],
    "clarity": "string",
    "summary": "string"
  },

  "conversionConfidence": {
    "score": 0,
    "conversionReadiness": "string",
    "barriers": ["string"],
    "summary": "string"
  },

  "summary": "string"
}

Be psychologically intelligent.
Be commercially useful.
Avoid generic observations.
Reference real visible interface elements.
`;

export class GeminiService {
  private client: GoogleGenerativeAI;
  private modelName = "gemini-2.5-flash";

  constructor() {
    this.client = new GoogleGenerativeAI(config.geminiApiKey);
  }

  async analyzeScreenshot(
    screenshot: ScreenshotResult,
    url: string
  ): Promise<GeminiAnalysisResult> {
    const startTime = Date.now();

    logger.info("GeminiService", `Analyzing screenshot for: ${url}`);

    const model = this.client.getGenerativeModel({
      model: this.modelName,
      generationConfig: {
        temperature: 0.4,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    });

    const imageBase64 = screenshot.buffer.toString("base64");

    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: screenshot.mimeType,
      },
    };

    const textPart = {
      text: `Website URL: ${url}\n\n${ANALYSIS_PROMPT}`,
    };

    try {
      const result = await model.generateContent([textPart, imagePart]);

      const response = result.response;

      const rawText = response.text();

      const elapsed = Date.now() - startTime;

      logger.info(
        "GeminiService",
        `Analysis complete in ${elapsed}ms`
      );

      return this.parseAndValidate(rawText);

    } catch (err) {
      const message =
        err instanceof Error ? err.message : String(err);

      logger.error(
        "GeminiService",
        `Gemini API error: ${message}`
      );

      throw new Error(`Gemini analysis failed: ${message}`);
    }
  }

  private parseAndValidate(rawText: string): GeminiAnalysisResult {
    try {
      const cleaned = rawText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();

      return JSON.parse(cleaned);

    } catch (err) {
      logger.error(
        "GeminiService",
        "Failed to parse Gemini JSON",
        { rawText }
      );

      throw new Error(
        "Gemini returned invalid JSON."
      );
    }
  }
}

export const geminiService = new GeminiService();