import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { getReport } from "@/lib/api";
import { FullReport } from "@/components/report/FullReport";
import { Spinner } from "@/components/ui/Spinner";
import type { AnalysisReport } from "@/types";

// ─── ReportPage ───────────────────────────────────────────────────────────────
// Permalink page for a specific report, loaded from backend by ID

export const ReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("No report ID provided.");
      setLoading(false);
      return;
    }

    getReport(id)
      .then((data) => {
        setReport(data);
      })
      .catch((err: Error) => {
        setError(err.message || "Failed to load report.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-zinc-500">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl border border-red-500/20 bg-red-500/[0.05] space-y-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-red-400">Report Not Found</p>
              <p className="text-sm text-red-400/70">
                {error || "This report does not exist or has been deleted."}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to analyzer
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <FullReport
      report={report}
      onReset={() => navigate("/")}
    />
  );
};
