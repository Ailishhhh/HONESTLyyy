// ─── Core Report Types ────────────────────────────────────────────────────────

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

export interface ExecutiveVerdict {
  headline: string;
  primaryWeakness: string;
  primaryStrength: string;
  estimatedBusinessImpact: "high" | "medium" | "low";
  summary: string;
}

export interface PsychologicalProfile {
  brandPersonality: string[];
  emotionalTone: string;
  userPerception: string;
  trustLevel: "low" | "medium" | "high" | "elite";
  summary: string;
}

export interface FirstImpression {
  clarity: string;
  visualImpact: string;
  confidenceSignal: string;
  summary: string;
}

export interface PriorityFix {
  title: string;
  impact: "high" | "medium" | "low";
  description: string;
  recommendation: string;
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

  executiveVerdict: ExecutiveVerdict;
  psychologicalProfile: PsychologicalProfile;
  firstImpression: FirstImpression;
  priorityFixes: PriorityFix[];

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

// ─── API Types ────────────────────────────────────────────────────────────────

export interface AnalyzeRequest {
  url: string;
}

export interface AnalyzeResponse {
  success: boolean;
  report: AnalysisReport;
  error?: string;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
}

// ─── Auth Types ───────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
}

// ─── Report History ───────────────────────────────────────────────────────────

export interface ReportListItem {
  id: string;
  url: string;
  overallScore: number;
  createdAt: string;
  screenshotUrl: string | null;
}