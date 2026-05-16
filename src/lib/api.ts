import axios, { AxiosError } from "axios";
import env from "@/config/env";
import { supabase } from "@/lib/supabase";
import type {
  AnalyzeResponse,
  ReportListItem,
  AnalysisReport,
} from "@/types";

// ─── Axios Instance ───────────────────────────────────────────

const api = axios.create({
  baseURL: env.API_URL,
  timeout: 300000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Attach Supabase JWT ──────────────────────────────────────

api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();

  const token = data.session?.access_token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ─── Normalize Errors ─────────────────────────────────────────

api.interceptors.response.use(
  (response) => response,

  (error: AxiosError<{ error: string }>) => {
    const message =
      error.response?.data?.error ||
      error.message ||
      "Unexpected error";

    return Promise.reject(new Error(message));
  }
);

// ─── Analyze URL ──────────────────────────────────────────────

export const analyzeUrl = async (
  url: string
): Promise<AnalyzeResponse> => {
  const response = await api.post<AnalyzeResponse>(
    "/analyze",
    {
      url,
    }
  );

  return response.data;
};

// ─── Get Single Report ────────────────────────────────────────

export const getReport = async (
  reportId: string
): Promise<AnalysisReport> => {
  const response = await api.get<{
    success: boolean;
    report: AnalysisReport;
  }>(`/report/${reportId}`);

  return response.data.report;
};

// ─── Get Report History ───────────────────────────────────────

export const getReportHistory = async (): Promise<
  ReportListItem[]
> => {
  const response = await api.get<{
    success: boolean;
    reports: ReportListItem[];
  }>("/api/reports");

  return response.data.reports;
};

// ─── Delete Report ────────────────────────────────────────────

export const deleteReport = async (
  reportId: string
): Promise<void> => {
  await api.delete(`/report/${reportId}`);
};

// ─── Health Check ─────────────────────────────────────────────

export const healthCheck = async (): Promise<{
  status: string;
  version: string;
}> => {
  const response = await api.get<{
    status: string;
    version: string;
  }>("/health");

  return response.data;
};

export default api;