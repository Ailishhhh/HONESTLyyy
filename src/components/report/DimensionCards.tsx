import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Shield, Type, Eye, Gem, MousePointerClick, Zap, TrendingUp } from "lucide-react";
import { ScoreRing } from "@/components/ui/ScoreRing";
import type { AnalysisReport } from "@/types";

// ─── DimensionCards ───────────────────────────────────────────────────────────

interface DimensionCardProps {
  icon: React.ReactNode;
  title: string;
  score: number;
  summary: string;
  details: React.ReactNode;
  delay?: number;
}

const DimensionCard: React.FC<DimensionCardProps> = ({
  icon,
  title,
  score,
  summary,
  details,
  delay = 0,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="border border-white/10 rounded-2xl bg-white/[0.02] overflow-hidden"
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full p-4 flex items-center gap-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <ScoreRing score={score} size={60} strokeWidth={5} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-zinc-500">{icon}</span>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              {title}
            </span>
          </div>
          <p className="text-sm text-zinc-300 line-clamp-2">{summary}</p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-zinc-600 flex-shrink-0 transition-transform duration-300 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-white/[0.06] pt-4">
              {details}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Helper: List renderer ────────────────────────────────────────────────────

const List: React.FC<{ items: string[]; label: string; variant?: "good" | "bad" | "neutral" }> = ({
  items,
  label,
  variant = "neutral",
}) => {
  if (!items || items.length === 0) return null;
  const dotColor =
    variant === "good"
      ? "bg-green-500"
      : variant === "bad"
      ? "bg-red-400"
      : "bg-zinc-500";

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{label}</p>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
            <div className={`w-1.5 h-1.5 rounded-full ${dotColor} mt-1.5 flex-shrink-0`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

// ─── Main DimensionCards Component ───────────────────────────────────────────

interface DimensionCardsProps {
  report: AnalysisReport;
}

export const DimensionCards: React.FC<DimensionCardsProps> = ({ report }) => {
  const { trustArchitecture, typographyIntelligence, visualHierarchy,
    premiumPerception, ctaClarity, cognitiveFriction, conversionConfidence } = report;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-widest">
        Deep Analysis
      </h3>
      <div className="grid grid-cols-1 gap-3">
        <DimensionCard
          icon={<Shield className="w-3.5 h-3.5" />}
          title="Trust Architecture"
          score={trustArchitecture.score}
          summary={trustArchitecture.summary}
          delay={0.3}
          details={
            <div className="space-y-4">
              <List items={trustArchitecture.signals} label="Trust Signals" variant="good" />
              <List items={trustArchitecture.gaps} label="Trust Gaps" variant="bad" />
            </div>
          }
        />

        <DimensionCard
          icon={<Type className="w-3.5 h-3.5" />}
          title="Typography Intelligence"
          score={typographyIntelligence.score}
          summary={typographyIntelligence.summary}
          delay={0.33}
          details={
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Font Hierarchy", value: typographyIntelligence.fontHierarchy },
                { label: "Readability", value: typographyIntelligence.readability },
                { label: "Consistency", value: typographyIntelligence.consistency },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{item.label}</p>
                  <p className="text-sm text-zinc-300">{item.value}</p>
                </div>
              ))}
            </div>
          }
        />

        <DimensionCard
          icon={<Eye className="w-3.5 h-3.5" />}
          title="Visual Hierarchy"
          score={visualHierarchy.score}
          summary={visualHierarchy.summary}
          delay={0.36}
          details={
            <div className="space-y-4">
              <List items={visualHierarchy.focalPoints} label="Focal Points" variant="good" />
              <List items={visualHierarchy.flowIssues} label="Flow Issues" variant="bad" />
            </div>
          }
        />

        <DimensionCard
          icon={<Gem className="w-3.5 h-3.5" />}
          title="Premium Perception"
          score={premiumPerception.score}
          summary={premiumPerception.summary}
          delay={0.39}
          details={
            <div className="space-y-4">
              <List items={premiumPerception.premiumSignals} label="Premium Signals" variant="good" />
              <List items={premiumPerception.detractors} label="Detractors" variant="bad" />
            </div>
          }
        />

        <DimensionCard
          icon={<MousePointerClick className="w-3.5 h-3.5" />}
          title="CTA Clarity"
          score={ctaClarity.score}
          summary={ctaClarity.summary}
          delay={0.42}
          details={
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Primary CTA", value: ctaClarity.primaryCTA },
                { label: "Clarity", value: ctaClarity.clarity },
                { label: "Urgency", value: ctaClarity.urgency },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{item.label}</p>
                  <p className="text-sm text-zinc-300">{item.value}</p>
                </div>
              ))}
            </div>
          }
        />

        <DimensionCard
          icon={<Zap className="w-3.5 h-3.5" />}
          title="Cognitive Friction"
          score={cognitiveFriction.score}
          summary={cognitiveFriction.summary}
          delay={0.45}
          details={
            <div className="space-y-4">
              <List items={cognitiveFriction.frictionPoints} label="Friction Points" variant="bad" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Clarity Assessment</p>
                <p className="text-sm text-zinc-300">{cognitiveFriction.clarity}</p>
              </div>
            </div>
          }
        />

        <DimensionCard
          icon={<TrendingUp className="w-3.5 h-3.5" />}
          title="Conversion Confidence"
          score={conversionConfidence.score}
          summary={conversionConfidence.summary}
          delay={0.48}
          details={
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Conversion Readiness</p>
                <p className="text-sm text-zinc-300">{conversionConfidence.conversionReadiness}</p>
              </div>
              <List items={conversionConfidence.barriers} label="Conversion Barriers" variant="bad" />
            </div>
          }
        />
      </div>
    </div>
  );
};
