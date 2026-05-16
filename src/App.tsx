import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "@/contexts/AuthContext";

import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

import { HomePage } from "@/pages/HomePage";
import { ReportPage } from "@/pages/ReportPage";
import { HistoryPage } from "@/pages/HistoryPage";
import { LoginPage } from "@/pages/LoginPage";
import { SignupPage } from "@/pages/SignupPage";

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>

        {/* Toasts */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1a1a1a",
              color: "#e4e4e7",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px",
              fontSize: "13px",
            },
            success: {
              iconTheme: {
                primary: "#22c55e",
                secondary: "#0a0a0a",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#0a0a0a",
              },
            },
          }}
        />

        <Layout>
          <Routes>

            {/* PUBLIC */}
            <Route path="/" element={<HomePage />} />
            <Route path="/report/:id" element={<ReportPage />} />

            {/* AUTH */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* PROTECTED */}
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <HistoryPage />
                </ProtectedRoute>
              }
            />

            {/* FALLBACK */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </Layout>

      </AuthProvider>
    </BrowserRouter>
  );
}