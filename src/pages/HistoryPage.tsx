import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  ExternalLink,
  Trash2,
  RefreshCw,
  AlertCircle,
  History,
  Search,
  SlidersHorizontal,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart2,
  Globe,
  ChevronRight,
} from "lucide-react";
import { useReportHistory } from "@/hooks/useReportHistory";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "@/components/ui/Spinner";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { cn } from "@/utils/cn";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getScoreLabel = (score: number) => {
  if (score >= 80) return { label: "Excellent", color: "text-emerald-400", dot: "bg-emerald-400" };
  if (score >= 60) return { label: "Good", color: "text-amber-400", dot: "bg-amber-400" };
  if (score >= 40) return { label: "Fair", color: "text-orange-400", dot: "bg-orange-400" };
  return { label: "Poor", color: "text-red-400", dot: "bg-red-400" };
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

const getDomain = (url: string) => {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatPill: React.FC<{ label: string; value: string | number; sub?: string }> = ({
  label,
  value,
  sub,
}) => (
  <div className="flex flex-col gap-0.5 px-4 py-3 rounded-xl bg-white/[0.025] border border-white/[0.06] min-w-[90px]">
    <span className="text-[10px] uppercase tracking-widest text-zinc-600 font-medium">{label}</span>
    <span className="text-lg font-semibold text-white tabular-nums leading-tight">{value}</span>
    {sub && <span className="text-[10px] text-zinc-600">{sub}</span>}
  </div>
);

type FilterValue = "all" | "excellent" | "good" | "fair" | "poor";

const FILTERS: { label: string; value: FilterValue }[] = [
  { label: "All", value: "all" },
  { label: "Excellent", value: "excellent" },
  { label: "Good", value: "good" },
  { label: "Fair", value: "fair" },
  { label: "Poor", value: "poor" },
];

const filterScore = (score: number, filter: FilterValue) => {
  if (filter === "all") return true;
  if (filter === "excellent") return score >= 80;
  if (filter === "good") return score >= 60 && score < 80;
  if (filter === "fair") return score >= 40 && score < 60;
  if (filter === "poor") return score < 40;
  return true;
};

// ─── Empty / Auth States ──────────────────────────────────────────────────────

const AuthGate: React.FC<{ onLogin: () => void; onSignup: () => void }> = ({
  onLogin,
  onSignup,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center space-y-6"
  >
    <div className="relative">
      <div className="absolute inset-0 rounded-full blur-2xl bg-white/5 scale-150" />
      <div className="relative w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
        <History className="w-7 h-7 text-zinc-500" />
      </div>
    </div>
    <div className="space-y-2 max-w-xs">
      <h2 className="text-xl font-semibold text-white tracking-tight">
        Sign in to view history
      </h2>
      <p className="text-sm text-zinc-500 leading-relaxed">
        Create an account to save and revisit your analysis reports over time.
      </p>
    </div>
    <div className="flex items-center gap-2">
      <button
        onClick={onLogin}
        className="px-4 py-2 rounded-lg border border-white/10 text-sm text-zinc-300 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-200"
      >
        Sign in
      </button>
      <button
        onClick={onSignup}
        className="px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:bg-zinc-100 transition-all duration-200 shadow-lg shadow-white/10"
      >
        Create account
      </button>
    </div>
  </motion.div>
);

const EmptyState: React.FC<{ onAnalyze: () => void }> = ({ onAnalyze }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    className="flex flex-col items-center justify-center py-28 space-y-5"
  >
    <div className="relative">
      <div className="absolute inset-0 rounded-full blur-3xl bg-white/[0.03] scale-[2]" />
      <div className="relative w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center">
        <BarChart2 className="w-7 h-7 text-zinc-600" />
      </div>
    </div>
    <div className="space-y-1.5 text-center">
      <p className="text-base font-medium text-zinc-300">No reports yet</p>
      <p className="text-sm text-zinc-600 max-w-[260px] leading-relaxed">
        Analyze your first website to start tracking honesty scores.
      </p>
    </div>
    <button
      onClick={onAnalyze}
      className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-zinc-100 transition-all duration-200 shadow-lg shadow-white/10"
    >
      Analyze a website
      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
    </button>
  </motion.div>
);

// ─── Report Card ──────────────────────────────────────────────────────────────

interface ReportCardProps {
  report: {
    id: string;
    url: string;
    overallScore: number;
    createdAt: string;
  };
  index: number;
  onNavigate: (id: string) => void;
  onRemove: (id: string) => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, index, onNavigate, onRemove }) => {
  const domain = getDomain(report.url);
  const date = formatDate(report.createdAt);
  const time = formatTime(report.createdAt);
  const { label, color, dot } = getScoreLabel(report.overallScore);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{
        delay: index * 0.035,
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
      layout
    >
      <div
        className="group relative border border-white/[0.06] rounded-2xl bg-white/[0.018] backdrop-blur-sm overflow-hidden cursor-pointer transition-all duration-300 hover:border-white/[0.13] hover:bg-white/[0.035] hover:shadow-xl hover:shadow-black/40"
        onClick={() => onNavigate(report.id)}
      >
        {/* Subtle left accent bar keyed to score */}
        <div
          className={cn(
            "absolute left-0 top-0 bottom-0 w-[2px] rounded-l-2xl transition-opacity duration-300 opacity-0 group-hover:opacity-100",
            report.overallScore >= 80 && "bg-emerald-400/60",
            report.overallScore >= 60 && report.overallScore < 80 && "bg-amber-400/60",
            report.overallScore >= 40 && report.overallScore < 60 && "bg-orange-400/60",
            report.overallScore < 40 && "bg-red-400/60"
          )}
        />

        <div className="flex items-center gap-4 px-5 py-4">
          {/* Score ring */}
          <ScoreRing score={report.overallScore} size={52} stroke={3} />

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 min-w-0">
              <p className="text-sm font-semibold text-white truncate tracking-tight">{domain}</p>
              <span className="flex-shrink-0 flex items-center gap-1">
                <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", dot)} />
                <span className={cn("text-[11px] font-medium hidden sm:inline", color)}>
                  {label}
                </span>
              </span>
            </div>
            <p className="text-[11px] font-mono text-zinc-600 truncate">{report.url}</p>
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-600">
              <Clock className="w-3 h-3 flex-shrink-0" />
              <span>{date}</span>
              <span className="text-zinc-700">·</span>
              <span>{time}</span>
            </div>
          </div>

          {/* Actions */}
          <div
            className="flex items-center gap-1 ml-auto pl-2 opacity-0 group-hover:opacity-100 transition-all duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <a
              href={report.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-zinc-600 hover:text-zinc-200 hover:bg-white/[0.07] transition-all duration-150"
              title="Open URL"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={() => onRemove(report.id)}
              className="p-2 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
              title="Delete report"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Arrow indicator */}
          <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0" />
        </div>
      </div>
    </motion.div>
  );
};

// ─── HistoryPage ──────────────────────────────────────────────────────────────

export const HistoryPage: React.FC = () => {
  const { user } = useAuth();
  const { reports, loading, error, refresh, remove } = useReportHistory();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");

  // Derived stats
  const avgScore = useMemo(() => {
    if (!reports.length) return 0;
    return Math.round(
      reports.reduce((acc: number, r: { overallScore: number }) => acc + r.overallScore, 0) /
        reports.length
    );
  }, [reports]);

  const bestScore = useMemo(
    () =>
      reports.length
        ? Math.max(...reports.map((r: { overallScore: number }) => r.overallScore))
        : 0,
    [reports]
  );

  const trend = useMemo(() => {
    if (reports.length < 2) return null;
    const sorted = [...reports].sort(
      (a: { createdAt: string }, b: { createdAt: string }) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const delta =
      (sorted[sorted.length - 1] as { overallScore: number }).overallScore -
      (sorted[0] as { overallScore: number }).overallScore;
    return delta;
  }, [reports]);

  // Filtered list
  const filtered = useMemo(() => {
    return reports.filter((r: { url: string; overallScore: number }) => {
      const matchSearch =
        !search ||
        getDomain(r.url).toLowerCase().includes(search.toLowerCase()) ||
        r.url.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filterScore(r.overallScore, activeFilter);
      return matchSearch && matchFilter;
    });
  }, [reports, search, activeFilter]);

  // ── Auth gate ──
  if (!user) {
    return (
      <AuthGate
        onLogin={() => navigate("/login")}
        onSignup={() => navigate("/signup")}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-start justify-between gap-4"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
              <History className="w-3.5 h-3.5 text-zinc-400" />
            </div>
            <h1 className="text-xl font-semibold text-white tracking-tight">Analysis History</h1>
          </div>
          <p className="text-sm text-zinc-600 pl-9">
            {reports.length > 0
              ? `${reports.length} report${reports.length !== 1 ? "s" : ""} · all time`
              : "No reports saved yet"}
          </p>
        </div>

        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-500 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed mt-0.5"
        >
          <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
          Refresh
        </button>
      </motion.div>

      {/* ── Stats Strip (only when reports exist) ── */}
      <AnimatePresence>
        {reports.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar"
          >
            <StatPill label="Reports" value={reports.length} sub="total" />
            <StatPill label="Avg Score" value={avgScore} sub="/ 100" />
            <StatPill label="Best Score" value={bestScore} sub="highest" />
            {trend !== null && (
              <div className="flex flex-col gap-0.5 px-4 py-3 rounded-xl bg-white/[0.025] border border-white/[0.06] min-w-[90px]">
                <span className="text-[10px] uppercase tracking-widest text-zinc-600 font-medium">Trend</span>
                <div className="flex items-center gap-1">
                  {trend > 0 ? (
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  ) : trend < 0 ? (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  ) : (
                    <Minus className="w-4 h-4 text-zinc-500" />
                  )}
                  <span
                    className={cn(
                      "text-lg font-semibold tabular-nums leading-tight",
                      trend > 0 ? "text-emerald-400" : trend < 0 ? "text-red-400" : "text-zinc-500"
                    )}
                  >
                    {trend > 0 ? `+${trend}` : trend}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-600">first → last</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Error Banner ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="flex items-start gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/[0.05]"
          >
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-400 leading-relaxed">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Loading ── */}
      {loading && reports.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 gap-4"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full blur-xl bg-white/5 scale-150" />
            <Spinner size="md" />
          </div>
          <p className="text-sm text-zinc-600">Loading reports…</p>
        </motion.div>
      )}

      {/* ── Empty State ── */}
      {!loading && reports.length === 0 && !error && (
        <EmptyState onAnalyze={() => navigate("/")} />
      )}

      {/* ── Search + Filters ── */}
      {reports.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-3"
        >
          {/* Search input */}
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600 group-focus-within:text-zinc-400 transition-colors duration-200" />
            <input
              type="text"
              placeholder="Search by domain or URL…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.07] text-sm text-zinc-300 placeholder-zinc-700 outline-none focus:border-white/[0.15] focus:bg-white/[0.05] transition-all duration-200 font-mono"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <SlidersHorizontal className="w-3 h-3 text-zinc-700 mr-0.5 flex-shrink-0" />
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 border",
                  activeFilter === f.value
                    ? "bg-white text-black border-white shadow-sm shadow-white/20"
                    : "text-zinc-500 border-white/[0.06] hover:border-white/[0.12] hover:text-zinc-300 bg-white/[0.02]"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── No filter results ── */}
      <AnimatePresence>
        {reports.length > 0 && filtered.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-2 py-12 text-center"
          >
            <Globe className="w-6 h-6 text-zinc-700" />
            <p className="text-sm text-zinc-600">No reports match your search.</p>
            <button
              onClick={() => {
                setSearch("");
                setActiveFilter("all");
              }}
              className="text-xs text-zinc-500 hover:text-zinc-300 underline underline-offset-2 transition-colors"
            >
              Clear filters
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Reports List ── */}
      {filtered.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.18 }}
          className="space-y-2"
        >
          {/* Result count when filtered */}
          {(search || activeFilter !== "all") && (
            <p className="text-xs text-zinc-600 pb-1">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </p>
          )}

          <AnimatePresence mode="popLayout">
            {filtered.map(
              (
                report: {
                  id: string;
                  url: string;
                  overallScore: number;
                  createdAt: string;
                },
                i: number
              ) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  index={i}
                  onNavigate={(id) => navigate(`/report/${id}`)}
                  onRemove={remove}
                />
              )
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── Bottom fade gradient hint ── */}
      {filtered.length > 5 && (
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      )}
    </div>
  );
};