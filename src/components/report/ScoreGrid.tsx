import React from "react";
import { motion } from "framer-motion";
import { ScoreBar } from "@/components/ui/ScoreBar";
import type { AnalysisScores } from "@/types";

// ─── ScoreGrid ────────────────────────────────────────────────────────────────

interface ScoreGridProps {
  scores: AnalysisScores;
}

interface ScoreItem {
  key: keyof Omit<AnalysisScores, "overall">;
  label: string;
  description: string;
}

const SCORE_ITEMS: ScoreItem[] = [
  {
    key: "trust",
    label: "Trust Architecture",
    description: "Credibility signals, social proof, security indicators",
  },
  {
    key: "typography",
    label: "Typography Quality",
    description: "Font hierarchy, readability, typographic consistency",
  },
  {
    key: "hierarchy",
    label: "Visual Hierarchy",
    description: "Information structure, focal points, visual flow",
  },
  {
    key: "premium",
    label: "Premium Perception",
    description: "Brand quality signals, visual restraint, polish level",
  },
  {
    key: "ctaClarity",
    label: "CTA Clarity",
    description: "Call-to-action visibility, urgency, conversion pathway",
  },
  {
    key: "cognitiveFriction",
    label: "Cognitive Friction",
    description: "Complexity, overwhelm, decision fatigue indicators (lower = better, score inverted)",
  },
  {
    key: "conversionConfidence",
    label: "Conversion Confidence",
    description: "Overall conversion readiness and persuasion architecture",
  },
];

export const ScoreGrid: React.FC<ScoreGridProps> = ({ scores }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="border border-white/10 rounded-2xl bg-white/[0.02] p-6"
    >
      <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-widest mb-6">
        Dimension Scores
      </h3>
      <div className="space-y-5">
        {SCORE_ITEMS.map((item, i) => (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            <ScoreBar
              label={item.label}
              score={scores[item.key]}
              description={item.description}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
