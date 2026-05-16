import { useState, useEffect, useCallback } from "react";
import { getReportHistory, deleteReport } from "@/lib/api";
import type { ReportListItem } from "@/types";

// ─── useReportHistory Hook ─────────────────────────────────────────────────────

interface UseReportHistoryReturn {
  reports: ReportListItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useReportHistory = (): UseReportHistoryReturn => {
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getReportHistory();
      setReports(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load reports";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      await deleteReport(id);
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete report";
      setError(message);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { reports, loading, error, refresh, remove };
};
