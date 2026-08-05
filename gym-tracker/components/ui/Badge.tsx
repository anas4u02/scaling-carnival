"use client";

import type { BadgeProps } from "@/types";
import { PHASE_LABELS, PHASE_COLORS } from "@/lib/phaseUtils";

export function Badge({ phase, variant = "soft" }: BadgeProps) {
  const colors = PHASE_COLORS[phase];
  if (variant === "solid") {
    return (
      <span
        className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full ${colors.bg} text-white`}
      >
        {PHASE_LABELS[phase]}
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center text-xs font-medium px-3 py-1 rounded-full border ${colors.badge}`}
    >
      Phase {phase}
    </span>
  );
}
