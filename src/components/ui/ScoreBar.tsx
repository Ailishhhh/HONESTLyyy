import React from "react";

// ─── ScoreBar ──────────────────────────────────────────────────────────────────
// Horizontal score bar with label and value

interface ScoreBarProps {
  label: string;
  score: number;
  description?: string;
  className?: string;
}

const getBarColor = (score: number): string => {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-amber-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
};

export const ScoreBar: React.FC<ScoreBarProps> = ({
  label,
  score,
  description,
  className = "",
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-300">{label}</span>
        <span className="text-sm font-bold tabular-nums text-white">
          {score}
          <span className="text-zinc-500 font-normal">/100</span>
        </span>
      </div>
      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${getBarColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
      {description && (
        <p className="text-xs text-zinc-500">{description}</p>
      )}
    </div>
  );
};
