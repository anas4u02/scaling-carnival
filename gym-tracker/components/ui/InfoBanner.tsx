"use client";

import type { InfoBannerProps } from "@/types";

const VARIANTS = {
  warning: {
    bg: "bg-amber-950/40",
    border: "border-amber-700/30",
    titleColor: "text-amber-400",
    msgColor: "text-amber-200/70",
  },
  danger: {
    bg: "bg-red-950/40",
    border: "border-red-700/30",
    titleColor: "text-red-400",
    msgColor: "text-red-200/70",
  },
  info: {
    bg: "bg-blue-950/40",
    border: "border-blue-700/30",
    titleColor: "text-blue-400",
    msgColor: "text-blue-200/70",
  },
};

export function InfoBanner({ variant, title, message }: InfoBannerProps) {
  const v = VARIANTS[variant];
  return (
    <div className={`rounded-xl border p-3 ${v.bg} ${v.border}`}>
      <div className={`text-xs font-medium ${v.titleColor} mb-0.5`}>{title}</div>
      {message && (
        <div className={`text-xs leading-relaxed ${v.msgColor}`}>{message}</div>
      )}
    </div>
  );
}
