import axios, { AxiosError } from "axios";
import env from "@/config/env";
import { supabase } from "@/lib/supabase";
import type { AnalyzeResponse, ReportListItem, AnalysisReport } from "@/types";

// ─── Axios Instance ────────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: env.API_URL,
  timeout: 120000, // 2 min — Playwright can be slow
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor: Attach Supabase JWT ─────────────────────────────────

api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response Interceptor: Normalize Errors ───────────────────────────────────

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error: string; code?: string }>) => {
    const message =
      error.response?.data?.error ||
      error.message ||
      "An unexpected error occurred";
    return Promise.reject(new Error(message));
  }
);

// ─── API Methods ───────────────────────────────────────────────────────────────

export const analyzeUrl = async (url: string): Promise<AnalyzeResponse> => {
  const response = await api.post<AnalyzeResponse>("/analyze", { url });
  return response.data;
};

export const getReport = async (reportId: string): Promise<AnalysisReport> => {
  const response = await api.get<{ success: boolean; report: AnalysisReport }>(
    `/api/reports/${reportId}`
  );
  return response.data.report;
};

export const getReportHistory = async (): Promise<ReportListItem[]> => {
  const response = await api.get<{
    success: boolean;
    reports: ReportListItem[];
  }>("/api/reports");
  return response.data.reports;
};

export const deleteReport = async (reportId: string): Promise<void> => {
  await api.delete(`/api/reports/${reportId}`);
};

export const healthCheck = async (): Promise<{ status: string; version: string }> => {
  const response = await api.get<{ status: string; version: string }>("/health");
  return response.data;
};

export default api;
