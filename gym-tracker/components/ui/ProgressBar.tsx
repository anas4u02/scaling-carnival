"use client";

import type { ProgressBarProps } from "@/types";
import { PHASE_COLORS } from "@/lib/phaseUtils";

export function ProgressBar({ done, total, phase }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const colors = PHASE_COLORS[phase];

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colors.bg}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-xs text-gray-400 flex-shrink-0 w-10 text-right">
        {pct === 100 ? (
          <span className="text-emerald-400">✓</span>
        ) : (
          `${done}/${total}`
        )}
      </div>
    </div>
  );
}
