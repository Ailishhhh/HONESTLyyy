import React from "react";

// ─── Badge ─────────────────────────────────────────────────────────────────────

type BadgeVariant = "critical" | "warning" | "info" | "success" | "neutral";

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  critical: "bg-red-500/10 text-red-400 border border-red-500/20",
  warning: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  info: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  success: "bg-green-500/10 text-green-400 border border-green-500/20",
  neutral: "bg-white/[0.06] text-zinc-400 border border-white/10",
};

export const Badge: React.FC<BadgeProps> = ({
  variant,
  children,
  className = "",
}) => {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${VARIANT_STYLES[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
