import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Info, XCircle, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { AnalysisIssue, AnalysisStrength } from "@/types";

// ─── IssuesPanel ──────────────────────────────────────────────────────────────

interface IssuesPanelProps {
  issues: AnalysisIssue[];
  strengths: AnalysisStrength[];
}

const SEVERITY_ICONS = {
  critical: <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />,
  info: <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />,
};

const SEVERITY_BADGE_VARIANT = {
  critical: "critical" as const,
  warning: "warning" as const,
  info: "info" as const,
};

export const IssuesPanel: React.FC<IssuesPanelProps> = ({ issues, strengths }) => {
  const critical = issues.filter((i) => i.severity === "critical");
  const warnings = issues.filter((i) => i.severity === "warning");
  const infos = issues.filter((i) => i.severity === "info");
  const ordered = [...critical, ...warnings, ...infos];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Issues */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="border border-white/10 rounded-2xl bg-white/[0.02] p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-widest">
            Issues Detected
          </h3>
          <div className="flex gap-1.5">
            {critical.length > 0 && (
              <Badge variant="critical">{critical.length} critical</Badge>
            )}
            {warnings.length > 0 && (
              <Badge variant="warning">{warnings.length} warning</Badge>
            )}
          </div>
        </div>

        {ordered.length === 0 ? (
          <p className="text-sm text-zinc-500">No significant issues detected.</p>
        ) : (
          <div className="space-y-3">
            {ordered.map((issue, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.04 }}
                className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2"
              >
                <div className="flex items-start gap-2">
                  {SEVERITY_ICONS[issue.severity]}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={SEVERITY_BADGE_VARIANT[issue.severity]}>
                        {issue.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-zinc-300">{issue.description}</p>
                  </div>
                </div>
                {issue.recommendation && (
                  <div className="flex items-start gap-2 pl-6">
                    <Lightbulb className="w-3 h-3 text-zinc-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-zinc-500">{issue.recommendation}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Strengths */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="border border-white/10 rounded-2xl bg-white/[0.02] p-6 space-y-4"
      >
        <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-widest">
          Identified Strengths
        </h3>

        {strengths.length === 0 ? (
          <p className="text-sm text-zinc-500">No significant strengths identified.</p>
        ) : (
          <div className="space-y-3">
            {strengths.map((strength, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.04 }}
                className="p-3 rounded-xl bg-green-500/[0.04] border border-green-500/10 space-y-1.5"
              >
                <Badge variant="success">{strength.category}</Badge>
                <p className="text-sm text-zinc-300">{strength.description}</p>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};
