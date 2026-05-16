import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { config } from "../config/env.js";
import { logger } from "../utils/logger.js";
import type { GeminiAnalysisResult, ScreenshotResult } from "../types/index.js";

// ─── Gemini Vision Service ─────────────────────────────────────────────────────

const ANALYSIS_PROMPT = `
You are HONESTLY?, an expert AI interface intelligence system.

You are analyzing a screenshot of a website. Your task is to perform a comprehensive UI/UX audit and return a structured JSON report.

Analyze the following dimensions with expert precision:

1. **Trust Architecture** — Credibility signals (testimonials, logos, security badges, social proof, author bios), trust gaps, and psychological safety
2. **Typography Intelligence** — Font hierarchy clarity, readability, line spacing, font pairing consistency, weight distribution
3. **Visual Hierarchy** — Information structure, Z/F pattern compliance, focal point clarity, whitespace usage, attention flow
4. **Premium Perception** — Visual restraint, spacing discipline, color palette sophistication, quality signals, brand consistency
5. **CTA Clarity** — Primary call-to-action visibility, button design, copy clarity, urgency signals, conversion pathway
6. **Cognitive Friction** — Decision complexity, information overload, confusing navigation, unclear value proposition, form friction
7. **Conversion Confidence** — Overall persuasion architecture, objection handling, value communication, risk reversal signals

Score each dimension from 0–100 based on what you observe in the screenshot.

For Cognitive Friction: score represents how friction-FREE the interface is (100 = zero friction, 0 = extremely confusing).

Return ONLY valid JSON matching this exact schema. No markdown, no explanation, just raw JSON:

{
  "scores": {
    "overall": <integer 0-100>,
    "trust": <integer 0-100>,
    "typography": <integer 0-100>,
    "hierarchy": <integer 0-100>,
    "premium": <integer 0-100>,
    "ctaClarity": <integer 0-100>,
    "cognitiveFriction": <integer 0-100>,
    "conversionConfidence": <integer 0-100>
  },
  "issues": [
    {
      "category": "<dimension name>",
      "severity": "<critical|warning|info>",
      "description": "<specific observation about what's wrong>",
      "recommendation": "<actionable fix>"
    }
  ],
  "strengths": [
    {
      "category": "<dimension name>",
      "description": "<specific observation about what's working well>"
    }
  ],
  "trustArchitecture": {
    "score": <integer 0-100>,
    "signals": ["<trust signal observed>"],
    "gaps": ["<missing trust element>"],
    "summary": "<2-3 sentence expert assessment>"
  },
  "typographyIntelligence": {
    "score": <integer 0-100>,
    "fontHierarchy": "<assessment of heading/body hierarchy>",
    "readability": "<assessment of text legibility and sizing>",
    "consistency": "<assessment of typographic consistency>",
    "summary": "<2-3 sentence expert assessment>"
  },
  "visualHierarchy": {
    "score": <integer 0-100>,
    "focalPoints": ["<observed focal point>"],
    "flowIssues": ["<hierarchy problem>"],
    "summary": "<2-3 sentence expert assessment>"
  },
  "premiumPerception": {
    "score": <integer 0-100>,
    "premiumSignals": ["<observed premium signal>"],
    "detractors": ["<element reducing premium perception>"],
    "summary": "<2-3 sentence expert assessment>"
  },
  "ctaClarity": {
    "score": <integer 0-100>,
    "primaryCTA": "<description of primary call-to-action>",
    "clarity": "<assessment of CTA clarity>",
    "urgency": "<assessment of urgency signals>",
    "summary": "<2-3 sentence expert assessment>"
  },
  "cognitiveFriction": {
    "score": <integer 0-100>,
    "frictionPoints": ["<specific friction element>"],
    "clarity": "<assessment of overall message clarity>",
    "summary": "<2-3 sentence expert assessment>"
  },
  "conversionConfidence": {
    "score": <integer 0-100>,
    "conversionReadiness": "<assessment of overall conversion readiness>",
    "barriers": ["<specific conversion barrier>"],
    "summary": "<2-3 sentence expert assessment>"
  },
  "summary": "<3-4 sentence executive summary of overall interface intelligence>"
}

Be specific, observational, and actionable. Reference actual elements visible in the screenshot.
Do not include any text outside the JSON object.
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
        temperature: 0.3, // Low temperature for consistent, analytical output
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

    // Convert buffer to base64 for Gemini
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
      logger.info("GeminiService", `Analysis complete in ${elapsed}ms`);

      return this.parseAndValidate(rawText, url);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("GeminiService", `Gemini API error: ${message}`);
      throw new Error(`Gemini analysis failed: ${message}`);
    }
  }

  private parseAndValidate(rawText: string, url: string): GeminiAnalysisResult {
    let parsed: unknown;

    try {
      // Strip any accidental markdown fences
      const cleaned = rawText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();

      parsed = JSON.parse(cleaned);
    } catch (err) {
      logger.error("GeminiService", "Failed to parse Gemini response JSON", { rawText, err });
      throw new Error("Gemini returned invalid JSON. Cannot build report.");
    }

    // Validate and normalize the parsed response
    return this.normalizeResult(parsed as Record<string, unknown>, url);
  }

  private normalizeResult(raw: Record<string, unknown>, _url: string): GeminiAnalysisResult {
    const scores = (raw.scores as Record<string, number>) || {};
    const clampScore = (val: unknown, fallback = 50): number => {
      const n = typeof val === "number" ? val : fallback;
      return Math.max(0, Math.min(100, Math.round(n)));
    };
    const arr = (val: unknown): string[] => Array.isArray(val) ? val.map(String) : [];
    const str = (val: unknown, fallback = ""): string =>
      typeof val === "string" ? val : fallback;
    const num = (val: unknown, fallback = 50): number =>
      typeof val === "number" ? clampScore(val) : fallback;

    const ta = (raw.trustArchitecture as Record<string, unknown>) || {};
    const ti = (raw.typographyIntelligence as Record<string, unknown>) || {};
    const vh = (raw.visualHierarchy as Record<string, unknown>) || {};
    const pp = (raw.premiumPerception as Record<string, unknown>) || {};
    const cta = (raw.ctaClarity as Record<string, unknown>) || {};
    const cf = (raw.cognitiveFriction as Record<string, unknown>) || {};
    const cc = (raw.conversionConfidence as Record<string, unknown>) || {};

    const issues = Array.isArray(raw.issues)
      ? (raw.issues as Array<Record<string, unknown>>).map((issue) => ({
          category: str(issue.category, "General"),
          severity: (["critical", "warning", "info"].includes(str(issue.severity))
            ? str(issue.severity)
            : "info") as "critical" | "warning" | "info",
          description: str(issue.description),
          recommendation: str(issue.recommendation),
        }))
      : [];

    const strengths = Array.isArray(raw.strengths)
      ? (raw.strengths as Array<Record<string, unknown>>).map((s) => ({
          category: str(s.category, "General"),
          description: str(s.description),
        }))
      : [];

    return {
      scores: {
        overall: clampScore(scores.overall),
        trust: clampScore(scores.trust),
        typography: clampScore(scores.typography),
        hierarchy: clampScore(scores.hierarchy),
        premium: clampScore(scores.premium),
        ctaClarity: clampScore(scores.ctaClarity),
        cognitiveFriction: clampScore(scores.cognitiveFriction),
        conversionConfidence: clampScore(scores.conversionConfidence),
      },
      issues,
      strengths,
      trustArchitecture: {
        score: num(ta.score),
        signals: arr(ta.signals),
        gaps: arr(ta.gaps),
        summary: str(ta.summary),
      },
      typographyIntelligence: {
        score: num(ti.score),
        fontHierarchy: str(ti.fontHierarchy),
        readability: str(ti.readability),
        consistency: str(ti.consistency),
        summary: str(ti.summary),
      },
      visualHierarchy: {
        score: num(vh.score),
        focalPoints: arr(vh.focalPoints),
        flowIssues: arr(vh.flowIssues),
        summary: str(vh.summary),
      },
      premiumPerception: {
        score: num(pp.score),
        premiumSignals: arr(pp.premiumSignals),
        detractors: arr(pp.detractors),
        summary: str(pp.summary),
      },
      ctaClarity: {
        score: num(cta.score),
        primaryCTA: str(cta.primaryCTA),
        clarity: str(cta.clarity),
        urgency: str(cta.urgency),
        summary: str(cta.summary),
      },
      cognitiveFriction: {
        score: num(cf.score),
        frictionPoints: arr(cf.frictionPoints),
        clarity: str(cf.clarity),
        summary: str(cf.summary),
      },
      conversionConfidence: {
        score: num(cc.score),
        conversionReadiness: str(cc.conversionReadiness),
        barriers: arr(cc.barriers),
        summary: str(cc.summary),
      },
      summary: str(raw.summary, "Analysis complete."),
    };
  }
}

export const geminiService = new GeminiService();
