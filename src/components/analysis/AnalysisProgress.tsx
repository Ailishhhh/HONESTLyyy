import React from "react";
import { motion } from "framer-motion";
import { Camera, Brain, FileText, Database, Check } from "lucide-react";

// ─── AnalysisProgress ─────────────────────────────────────────────────────────

type AnalysisStatus =
  | "idle"
  | "validating"
  | "capturing"
  | "analyzing"
  | "building"
  | "saving"
  | "done"
  | "error";

interface Step {
  id: AnalysisStatus;
  label: string;
  icon: React.ReactNode;
}

const STEPS: Step[] = [
  { id: "capturing", label: "Capturing screenshot", icon: <Camera className="w-3.5 h-3.5" /> },
  { id: "analyzing", label: "Gemini Vision analysis", icon: <Brain className="w-3.5 h-3.5" /> },
  { id: "building", label: "Building report", icon: <FileText className="w-3.5 h-3.5" /> },
  { id: "saving", label: "Saving to database", icon: <Database className="w-3.5 h-3.5" /> },
];

const STATUS_ORDER: AnalysisStatus[] = [
  "validating", "capturing", "analyzing", "building", "saving", "done",
];

const getStepStatus = (
  step: Step,
  currentStatus: AnalysisStatus
): "pending" | "active" | "done" => {
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);
  const stepIdx = STATUS_ORDER.indexOf(step.id);

  if (currentStatus === "done") return "done";
  if (stepIdx < currentIdx) return "done";
  if (stepIdx === currentIdx) return "active";
  return "pending";
};

interface AnalysisProgressProps {
  url: string;
  status: AnalysisStatus;
}

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({
  url,
  status,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="border border-white/10 rounded-2xl bg-white/[0.02] p-6 space-y-6">
        {/* URL being analyzed */}
        <div className="text-center space-y-1">
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium">
            Analyzing
          </p>
          <p className="text-sm font-mono text-white truncate px-4">{url}</p>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {STEPS.map((step) => {
            const stepStatus = getStepStatus(step, status);
            return (
              <div key={step.id} className="flex items-center gap-3">
                {/* Icon / Status indicator */}
                <div
                  className={`
                    w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-500
                    ${stepStatus === "done"
                      ? "bg-green-500/20 text-green-400"
                      : stepStatus === "active"
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-white/[0.04] text-zinc-600"
                    }
                  `}
                >
                  {stepStatus === "done" ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : stepStatus === "active" ? (
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  ) : (
                    step.icon
                  )}
                </div>

                {/* Label */}
                <span
                  className={`text-sm transition-colors duration-300 ${
                    stepStatus === "active"
                      ? "text-white font-medium"
                      : stepStatus === "done"
                      ? "text-zinc-400 line-through decoration-zinc-600"
                      : "text-zinc-600"
                  }`}
                >
                  {step.label}
                </span>

                {/* Active spinner */}
                {stepStatus === "active" && (
                  <div className="ml-auto">
                    <div className="w-4 h-4 border border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Note */}
        <p className="text-xs text-zinc-600 text-center">
          Playwright + Gemini Vision. This takes ~30–60 seconds.
        </p>
      </div>
    </motion.div>
  );
};
