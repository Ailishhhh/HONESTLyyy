// ─── Backend Types ─────────────────────────────────────────────────────────────

export interface AnalysisScores {
  overall: number;
  trust: number;
  typography: number;
  hierarchy: number;
  premium: number;
  ctaClarity: number;
  cognitiveFriction: number;
  conversionConfidence: number;
}

export interface AnalysisIssue {
  category: string;
  severity: "critical" | "warning" | "info";
  description: string;
  recommendation: string;
}

export interface AnalysisStrength {
  category: string;
  description: string;
}

export interface TrustArchitecture {
  score: number;
  signals: string[];
  gaps: string[];
  summary: string;
}

export interface TypographyIntelligence {
  score: number;
  fontHierarchy: string;
  readability: string;
  consistency: string;
  summary: string;
}

export interface VisualHierarchy {
  score: number;
  focalPoints: string[];
  flowIssues: string[];
  summary: string;
}

export interface PremiumPerception {
  score: number;
  premiumSignals: string[];
  detractors: string[];
  summary: string;
}

export interface CTAClarity {
  score: number;
  primaryCTA: string;
  clarity: string;
  urgency: string;
  summary: string;
}

export interface CognitiveFriction {
  score: number;
  frictionPoints: string[];
  clarity: string;
  summary: string;
}

export interface ConversionConfidence {
  score: number;
  conversionReadiness: string;
  barriers: string[];
  summary: string;
}

export interface AnalysisReport {
  id: string;
  url: string;
  screenshotUrl: string | null;
  scores: AnalysisScores;
  issues: AnalysisIssue[];
  strengths: AnalysisStrength[];
  trustArchitecture: TrustArchitecture;
  typographyIntelligence: TypographyIntelligence;
  visualHierarchy: VisualHierarchy;
  premiumPerception: PremiumPerception;
  ctaClarity: CTAClarity;
  cognitiveFriction: CognitiveFriction;
  conversionConfidence: ConversionConfidence;
  summary: string;
  createdAt: string;
  userId: string | null;
}

// ─── Screenshot Service Interface ─────────────────────────────────────────────
// Abstracted so Playwright can be swapped with kernel.sh or any provider

export interface ScreenshotResult {
  buffer: Buffer;
  mimeType: "image/png" | "image/jpeg";
  width: number;
  height: number;
  capturedAt: string;
}

export interface ScreenshotService {
  capture(url: string): Promise<ScreenshotResult>;
}

// ─── Gemini Service Interface ─────────────────────────────────────────────────

export interface GeminiAnalysisResult {
  scores: AnalysisScores;
  issues: AnalysisIssue[];
  strengths: AnalysisStrength[];
  trustArchitecture: TrustArchitecture;
  typographyIntelligence: TypographyIntelligence;
  visualHierarchy: VisualHierarchy;
  premiumPerception: PremiumPerception;
  ctaClarity: CTAClarity;
  cognitiveFriction: CognitiveFriction;
  conversionConfidence: ConversionConfidence;
  summary: string;
}

// ─── API Request/Response ─────────────────────────────────────────────────────

export interface AnalyzeRequestBody {
  url: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data?: T;
  report?: T;
  reports?: T;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ─── Database Row Types ───────────────────────────────────────────────────────

export interface ReportRow {
  id: string;
  user_id: string | null;
  url: string;
  screenshot_url: string | null;
  scores: AnalysisScores;
  issues: AnalysisIssue[];
  strengths: AnalysisStrength[];
  trust_architecture: TrustArchitecture;
  typography_intelligence: TypographyIntelligence;
  visual_hierarchy: VisualHierarchy;
  premium_perception: PremiumPerception;
  cta_clarity: CTAClarity;
  cognitive_friction: CognitiveFriction;
  conversion_confidence: ConversionConfidence;
  summary: string;
  created_at: string;
}
