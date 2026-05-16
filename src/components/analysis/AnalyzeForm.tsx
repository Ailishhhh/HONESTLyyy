import React, { useState } from "react";
import { motion } from "framer-motion";
import { ScanSearch, AlertCircle, ArrowRight } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";

// ─── AnalyzeForm ──────────────────────────────────────────────────────────────

interface AnalyzeFormProps {
  onAnalyze: (url: string) => void;
  loading: boolean;
  statusMessage: string;
}

const normalizeUrl = (input: string): string => {
  const trimmed = input.trim();
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return `https://${trimmed}`;
  }
  return trimmed;
};

const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.hostname.length > 0;
  } catch {
    return false;
  }
};

export const AnalyzeForm: React.FC<AnalyzeFormProps> = ({
  onAnalyze,
  loading,
  statusMessage,
}) => {
  const [input, setInput] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!input.trim()) {
      setValidationError("Please enter a URL to analyze.");
      return;
    }

    const normalized = normalizeUrl(input);
    if (!isValidUrl(normalized)) {
      setValidationError("Please enter a valid URL (e.g. example.com or https://example.com).");
      return;
    }

    onAnalyze(normalized);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (validationError) setValidationError(null);
            }}
            placeholder="https://example.com"
            disabled={loading}
            className={`
              w-full px-4 py-3.5 pr-36 rounded-xl
              bg-white/[0.05] border
              text-white placeholder-zinc-600
              text-sm font-mono
              focus:outline-none focus:ring-1
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              ${validationError
                ? "border-red-500/50 focus:ring-red-500/30 focus:border-red-500/50"
                : "border-white/10 focus:ring-white/20 focus:border-white/20"
              }
            `}
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="
              absolute right-2 top-1/2 -translate-y-1/2
              flex items-center gap-2 px-4 py-2 rounded-lg
              bg-white text-black text-sm font-medium
              hover:bg-zinc-200 active:bg-zinc-300
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-all duration-150
            "
          >
            {loading ? (
              <>
                <Spinner size="sm" className="border-black/20 border-t-black/60" />
                <span>Analyzing</span>
              </>
            ) : (
              <>
                <ScanSearch className="w-3.5 h-3.5" />
                <span>Analyze</span>
              </>
            )}
          </button>
        </div>

        {/* Validation error */}
        {validationError && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-sm text-red-400"
          >
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {validationError}
          </motion.div>
        )}

        {/* Loading status */}
        {loading && statusMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-sm text-zinc-500"
          >
            <div className="w-1 h-1 rounded-full bg-amber-400 animate-pulse" />
            {statusMessage}
          </motion.div>
        )}
      </form>

      {/* Examples */}
      {!loading && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-xs text-zinc-600">Try:</span>
          {["stripe.com", "linear.app", "vercel.com", "notion.so"].map((example) => (
            <button
              key={example}
              onClick={() => setInput(`https://${example}`)}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1 group"
            >
              {example}
              <ArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
