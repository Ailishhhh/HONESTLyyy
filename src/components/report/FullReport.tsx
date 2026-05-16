import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  RotateCcw,
  Share2,
  Brain,
  Sparkles,
  Target,
  BadgeAlert,
} from "lucide-react";

import { ReportHeader } from "./ReportHeader";
import { ScoreGrid } from "./ScoreGrid";
import { IssuesPanel } from "./IssuesPanel";
import { DimensionCards } from "./DimensionCards";
import { ScreenshotPanel } from "./ScreenshotPanel";

import type { AnalysisReport } from "@/types";

import toast from "react-hot-toast";

interface FullReportProps {
  report: AnalysisReport;
  onReset: () => void;
}

export const FullReport: React.FC<FullReportProps> = ({
  report,
  onReset,
}) => {
  const navigate = useNavigate();

  const handleShare = async () => {
    const url = `${window.location.origin}/report/${report.id}`;

    try {
      await navigator.clipboard.writeText(url);
      toast.success("Report URL copied to clipboard");
    } catch {
      toast.error("Could not copy URL");
    }
  };

  const executiveVerdict = report.executiveVerdict ?? {
    headline: "No executive verdict generated",
    primaryWeakness: "No weakness identified",
    primaryStrength: "No strength identified",
    estimatedBusinessImpact: "medium",
    summary: "Gemini did not return executive verdict data.",
  };

  const psychologicalProfile = report.psychologicalProfile ?? {
    brandPersonality: [],
    emotionalTone: "Unknown",
    userPerception: "Unknown",
    trustLevel: "medium",
    summary: "No psychological profile generated.",
  };

  const firstImpression = report.firstImpression ?? {
    clarity: "Unknown",
    visualImpact: "Unknown",
    confidenceSignal: "Unknown",
    summary: "No first impression analysis generated.",
  };

  const priorityFixes = report.priorityFixes ?? [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto px-4 py-8 space-y-6"
    >
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Analyze another
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share report
          </button>

          <button
            onClick={() => navigate(`/report/${report.id}`)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-white/10 hover:bg-white/15 text-white transition-colors"
          >
            View permalink
          </button>
        </div>
      </div>

      <ReportHeader report={report} />

      {/* Executive Verdict */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-white/10 rounded-2xl bg-white/[0.02] p-6 space-y-5"
      >
        <div className="flex items-center gap-2 text-zinc-300">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold uppercase tracking-widest">
            Executive Verdict
          </h3>
        </div>

        <h2 className="text-2xl font-bold text-white leading-snug">
          {executiveVerdict.headline}
        </h2>

        <p className="text-zinc-400 leading-relaxed">
          {executiveVerdict.summary}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="rounded-xl border border-green-500/10 bg-green-500/[0.04] p-4">
            <p className="text-xs uppercase tracking-widest text-green-400 mb-2">
              Primary Strength
            </p>

            <p className="text-sm text-zinc-300">
              {executiveVerdict.primaryStrength}
            </p>
          </div>

          <div className="rounded-xl border border-red-500/10 bg-red-500/[0.04] p-4">
            <p className="text-xs uppercase tracking-widest text-red-400 mb-2">
              Primary Weakness
            </p>

            <p className="text-sm text-zinc-300">
              {executiveVerdict.primaryWeakness}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Psychological Profile */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-white/10 rounded-2xl bg-white/[0.02] p-6 space-y-5"
      >
        <div className="flex items-center gap-2 text-zinc-300">
          <Brain className="w-4 h-4 text-violet-400" />
          <h3 className="text-sm font-semibold uppercase tracking-widest">
            Psychological Profile
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {psychologicalProfile.brandPersonality.map((trait, i) => (
            <div
              key={i}
              className="px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-xs text-zinc-300"
            >
              {trait}
            </div>
          ))}
        </div>

        <p className="text-zinc-400 leading-relaxed">
          {psychologicalProfile.summary}
        </p>
      </motion.div>

      {/* First Impression */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-white/10 rounded-2xl bg-white/[0.02] p-6 space-y-5"
      >
        <div className="flex items-center gap-2 text-zinc-300">
          <Target className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold uppercase tracking-widest">
            First Impression Analysis
          </h3>
        </div>

        <p className="text-zinc-400 leading-relaxed">
          {firstImpression.summary}
        </p>
      </motion.div>

      {/* Priority Fixes */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-white/10 rounded-2xl bg-white/[0.02] p-6 space-y-5"
      >
        <div className="flex items-center gap-2 text-zinc-300">
          <BadgeAlert className="w-4 h-4 text-red-400" />
          <h3 className="text-sm font-semibold uppercase tracking-widest">
            Priority Fixes
          </h3>
        </div>

        <div className="space-y-4">
          {priorityFixes.length === 0 ? (
            <p className="text-zinc-500 text-sm">
              No priority fixes generated.
            </p>
          ) : (
            priorityFixes.map((fix, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-white font-semibold">
                    {fix.title}
                  </h4>

                  <div className="px-2 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs uppercase tracking-widest">
                    {fix.impact} impact
                  </div>
                </div>

                <p className="text-sm text-zinc-400">
                  {fix.description}
                </p>

                <div className="rounded-lg bg-black/30 border border-white/5 p-3">
                  <p className="text-xs uppercase tracking-widest text-zinc-500 mb-1">
                    Recommendation
                  </p>

                  <p className="text-sm text-zinc-300">
                    {fix.recommendation}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <ScreenshotPanel
            screenshotUrl={report.screenshotUrl}
            url={report.url}
          />

          <ScoreGrid scores={report.scores} />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <IssuesPanel
            issues={report.issues}
            strengths={report.strengths}
          />

          <DimensionCards report={report} />
        </div>
      </div>
    </motion.div>
  );
};