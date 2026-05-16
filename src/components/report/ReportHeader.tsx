import React from "react";
import { motion } from "framer-motion";
import { ExternalLink, Clock } from "lucide-react";
import { ScoreRing } from "@/components/ui/ScoreRing";
import type { AnalysisReport } from "@/types";

// ─── ReportHeader ─────────────────────────────────────────────────────────────

interface ReportHeaderProps {
  report: AnalysisReport;
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({ report }) => {
  const formattedDate = new Date(report.createdAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const domain = (() => {
    try {
      return new URL(report.url).hostname;
    } catch {
      return report.url;
    }
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="border border-white/10 rounded-2xl bg-white/[0.02] p-6 sm:p-8"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        {/* Overall score ring */}
        <div className="flex-shrink-0">
          <ScoreRing score={report.scores.overall} size={140} strokeWidth={10} />
          <p className="text-center text-xs text-zinc-500 mt-1">Overall Score</p>
        </div>

        {/* Meta */}
        <div className="flex-1 min-w-0 space-y-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <a
                href={report.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm font-mono text-zinc-300 hover:text-white transition-colors group"
              >
                {domain}
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
              Interface Intelligence Report
            </h2>
          </div>

          {/* Summary */}
          <p className="text-sm text-zinc-400 leading-relaxed max-w-prose">
            {report.summary}
          </p>

          {/* Metadata row */}
          <div className="flex items-center gap-3 text-xs text-zinc-600">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formattedDate}
            </span>
            <span>·</span>
            <span>Report ID: {report.id.slice(0, 8)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
