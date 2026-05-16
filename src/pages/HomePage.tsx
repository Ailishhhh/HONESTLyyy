import React from "react";
import { motion } from "framer-motion";
import { AnalyzeForm } from "@/components/analysis/AnalyzeForm";
import { AnalysisProgress } from "@/components/analysis/AnalysisProgress";
import { FullReport } from "@/components/report/FullReport";
import { useAnalysis } from "@/hooks/useAnalysis";
import { AlertCircle, Shield, Type, Eye, Gem, MousePointerClick, Zap, TrendingUp } from "lucide-react";

// ─── HomePage ─────────────────────────────────────────────────────────────────

const FEATURE_ITEMS = [
  { icon: <Shield className="w-4 h-4" />, label: "Trust Architecture" },
  { icon: <Type className="w-4 h-4" />, label: "Typography Quality" },
  { icon: <Eye className="w-4 h-4" />, label: "Visual Hierarchy" },
  { icon: <Gem className="w-4 h-4" />, label: "Premium Perception" },
  { icon: <MousePointerClick className="w-4 h-4" />, label: "CTA Clarity" },
  { icon: <Zap className="w-4 h-4" />, label: "Cognitive Friction" },
  { icon: <TrendingUp className="w-4 h-4" />, label: "Conversion Confidence" },
];

export const HomePage: React.FC = () => {
  const { report, status, error, analyze, reset } = useAnalysis();

  const isLoading = ["validating", "capturing", "analyzing", "building", "saving"].includes(status);
  const [analyzedUrl, setAnalyzedUrl] = React.useState("");

  const handleAnalyze = async (url: string) => {
    setAnalyzedUrl(url);
    const result = await analyze(url);
    if (result) {
      // Optionally navigate to permalink
      // navigate(`/report/${result.id}`);
    }
  };

  // If we have a complete report, show it
  if (status === "done" && report) {
    return <FullReport report={report} onReset={reset} />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24 space-y-16">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.04] text-xs text-zinc-400 font-medium">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          AI-powered interface intelligence
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
          Does your website<br />
          <span className="text-zinc-500">actually convert?</span>
        </h1>

        <p className="text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
          Paste any URL. HONESTLY? captures a screenshot, runs Gemini Vision analysis,
          and returns a structured intelligence report on trust, hierarchy, and conversion confidence.
        </p>
      </motion.div>

      {/* Analyze Form */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        {!isLoading ? (
          <AnalyzeForm
            onAnalyze={handleAnalyze}
            loading={false}
            statusMessage=""
          />
        ) : (
          <AnalysisProgress url={analyzedUrl} status={status as "capturing" | "analyzing" | "building" | "saving" | "idle" | "validating" | "done" | "error"} />
        )}
      </motion.div>

      {/* Error state */}
      {status === "error" && error && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto"
        >
          <div className="flex items-start gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/[0.06]">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-sm font-medium text-red-400">Analysis Failed</p>
              <p className="text-sm text-red-400/70">{error}</p>
              <button
                onClick={reset}
                className="text-xs text-red-400 hover:text-red-300 underline transition-colors"
              >
                Try again
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Feature pills */}
      {!isLoading && status === "idle" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-2"
        >
          {FEATURE_ITEMS.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.07] bg-white/[0.02] text-xs text-zinc-500"
            >
              <span className="text-zinc-600">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
};
