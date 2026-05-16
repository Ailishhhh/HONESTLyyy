import React from "react";

// ─── Spinner ───────────────────────────────────────────────────────────────────

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_MAP = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-10 h-10",
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  className = "",
}) => {
  return (
    <div
      className={`${SIZE_MAP[size]} border-2 border-white/10 border-t-white/60 rounded-full animate-spin ${className}`}
    />
  );
};
