import React from "react";
import { cn } from "@/utils/cn";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "w-4 h-4 border-[1.5px]",
  md: "w-6 h-6 border-2",
  lg: "w-9 h-9 border-2",
};

export const Spinner: React.FC<SpinnerProps> = ({ size = "md", className }) => (
  <div
    className={cn(
      "rounded-full border-white/10 border-t-white/60 animate-spin",
      sizes[size],
      className
    )}
  />
);
