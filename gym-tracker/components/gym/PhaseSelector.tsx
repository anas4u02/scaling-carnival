"use client";

import type { PhaseSelectorProps, PhaseNumber } from "@/types";
import { PHASE_LABELS, PHASE_COLORS } from "@/lib/phaseUtils";

const PHASES: PhaseNumber[] = [1, 2, 3, 4];

export function PhaseSelector({ current, onChange }: PhaseSelectorProps) {
  return (
    <div className="flex gap-1.5">
      {PHASES.map((p) => {
        const colors = PHASE_COLORS[p];
        const isActive = current === p;
        return (
          <button
            key={p}
            id={`phase-btn-${p}`}
            onClick={() => onChange(p)}
            title={PHASE_LABELS[p]}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isActive
                ? `${colors.softBg} ${colors.border} ${colors.text}`
                : "bg-gray-800 border-gray-700 text-gray-500 hover:text-gray-400"
            }`}
          >
            P{p}
          </button>
        );
      })}
    </div>
  );
}
