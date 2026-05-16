import { useState, useCallback } from "react";
import { analyzeUrl } from "@/lib/api";
import type { AnalysisReport } from "@/types";

// ─── useAnalysis Hook ─────────────────────────────────────────────────────────

type AnalysisStatus =
  | "idle"
  | "validating"
  | "capturing"
  | "analyzing"
  | "building"
  | "saving"
  | "done"
  | "error";

const STATUS_MESSAGES: Record<AnalysisStatus, string> = {
  idle: "",
  validating: "Validating URL...",
  capturing: "Capturing screenshot...",
  analyzing: "Running AI analysis with Gemini Vision...",
  building: "Building intelligence report...",
  saving: "Saving report...",
  done: "Analysis complete.",
  error: "Analysis failed.",
};

interface UseAnalysisReturn {
  report: AnalysisReport | null;
  status: AnalysisStatus;
  statusMessage: string;
  error: string | null;
  analyze: (url: string) => Promise<AnalysisReport | null>;
  reset: () => void;
}

export const useAnalysis = (): UseAnalysisReturn => {
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  // Simulate progressive status updates while awaiting backend
  const runWithProgress = useCallback(async (url: string): Promise<AnalysisReport | null> => {
    setError(null);
    setReport(null);
    setStatus("validating");

    const progressTimer = setTimeout(() => {
      setStatus("capturing");
      const t2 = setTimeout(() => {
        setStatus("analyzing");
        const t3 = setTimeout(() => {
          setStatus("building");
        }, 8000);
        return () => clearTimeout(t3);
      }, 4000);
      return () => clearTimeout(t2);
    }, 800);

    try {
      const result = await analyzeUrl(url);
      clearTimeout(progressTimer);

      if (!result.success) {
        throw new Error(result.error || "Analysis failed");
      }

      setStatus("saving");
      await new Promise((r) => setTimeout(r, 300));
      setStatus("done");
      setReport(result.report);
      return result.report;
    } catch (err) {
      clearTimeout(progressTimer);
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      setStatus("error");
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setReport(null);
    setStatus("idle");
    setError(null);
  }, []);

  return {
    report,
    status,
    statusMessage: STATUS_MESSAGES[status],
    error,
    analyze: runWithProgress,
    reset,
  };
};
