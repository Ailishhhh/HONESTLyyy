import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, ExternalLink, Trash2, RefreshCw, AlertCircle, History } from "lucide-react";
import { useReportHistory } from "@/hooks/useReportHistory";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "@/components/ui/Spinner";

// ─── HistoryPage ──────────────────────────────────────────────────────────────

const getScoreColor = (score: number): string => {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-amber-400";
  if (score >= 40) return "text-orange-400";
  return "text-red-400";
};

const getScoreBg = (score: number): string => {
  if (score >= 80) return "bg-green-500/10 border-green-500/20";
  if (score >= 60) return "bg-amber-500/10 border-amber-500/20";
  if (score >= 40) return "bg-orange-500/10 border-orange-500/20";
  return "bg-red-500/10 border-red-500/20";
};

export const HistoryPage: React.FC = () => {
  const { user } = useAuth();
  const { reports, loading, error, refresh, remove } = useReportHistory();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center space-y-4">
        <History className="w-12 h-12 text-zinc-700 mx-auto" />
        <h2 className="text-xl font-semibold text-white">Sign in to view history</h2>
        <p className="text-sm text-zinc-500">
          Create an account to save and revisit your analysis reports.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 rounded-lg border border-white/10 text-sm text-zinc-300 hover:bg-white/[0.06] transition-colors"
          >
            Sign in
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors"
          >
            Create account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-white">Analysis History</h1>
          <p className="text-sm text-zinc-500">
            {reports.length} report{reports.length !== 1 ? "s" : ""} saved
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/[0.06]">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && reports.length === 0 && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <Spinner size="md" />
            <p className="text-sm text-zinc-500">Loading reports...</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && reports.length === 0 && !error && (
        <div className="text-center py-20 space-y-4">
          <History className="w-10 h-10 text-zinc-700 mx-auto" />
          <p className="text-zinc-500 text-sm">No reports yet.</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors"
          >
            Analyze a website
          </button>
        </div>
      )}

      {/* Reports grid */}
      {reports.length > 0 && (
        <div className="space-y-3">
          {reports.map((report, i) => {
            const domain = (() => {
              try { return new URL(report.url).hostname; } catch { return report.url; }
            })();
            const date = new Date(report.createdAt).toLocaleDateString("en-US", {
              month: "short", day: "numeric", year: "numeric",
            });

            return (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="group border border-white/[0.07] rounded-2xl bg-white/[0.02] p-4 flex items-center gap-4 hover:border-white/15 hover:bg-white/[0.04] transition-all cursor-pointer"
                onClick={() => navigate(`/report/${report.id}`)}
              >
                {/* Score badge */}
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-xl border flex items-center justify-center ${getScoreBg(report.overallScore)}`}
                >
                  <span className={`text-lg font-bold tabular-nums ${getScoreColor(report.overallScore)}`}>
                    {report.overallScore}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-0.5">
                  <p className="text-sm font-medium text-white truncate">{domain}</p>
                  <p className="text-xs font-mono text-zinc-600 truncate">{report.url}</p>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                    <Clock className="w-3 h-3" />
                    {date}
                  </div>
                </div>

                {/* Actions */}
                <div
                  className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <a
                    href={report.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.06] transition-colors"
                    title="Open URL"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => remove(report.id)}
                    className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete report"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
