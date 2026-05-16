import React, { useState } from "react";
import { motion } from "framer-motion";
import { ImageOff, ZoomIn, X } from "lucide-react";

// ─── ScreenshotPanel ──────────────────────────────────────────────────────────

interface ScreenshotPanelProps {
  screenshotUrl: string | null;
  url: string;
}

export const ScreenshotPanel: React.FC<ScreenshotPanelProps> = ({
  screenshotUrl,
  url,
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!screenshotUrl) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="border border-white/10 rounded-2xl bg-white/[0.02] p-6 flex flex-col items-center justify-center gap-3 min-h-[200px]"
      >
        <ImageOff className="w-8 h-8 text-zinc-700" />
        <p className="text-sm text-zinc-600">Screenshot not available</p>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="border border-white/10 rounded-2xl bg-white/[0.02] overflow-hidden group cursor-pointer"
        onClick={() => setLightboxOpen(true)}
      >
        <div className="relative">
          <img
            src={screenshotUrl}
            alt={`Screenshot of ${url}`}
            className="w-full object-cover object-top max-h-[320px]"
            style={{ imageRendering: "auto" }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20">
                <ZoomIn className="w-4 h-4 text-white" />
                <span className="text-sm text-white font-medium">View full screenshot</span>
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 py-2 border-t border-white/[0.06]">
          <p className="text-xs text-zinc-600 font-mono truncate">{url}</p>
        </div>
      </motion.div>

      {/* Lightbox */}
      {lightboxOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <img
            src={screenshotUrl}
            alt={`Full screenshot of ${url}`}
            className="max-w-full max-h-[90vh] object-contain rounded-xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          />
        </motion.div>
      )}
    </>
  );
};
