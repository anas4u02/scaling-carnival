"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

interface PeriodNavProps {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  canPrev?: boolean;
  canNext: boolean;
  prevLabel: string;
  nextLabel: string;
  trailing?: ReactNode;
}

export function PeriodNav({
  label,
  onPrev,
  onNext,
  canPrev = true,
  canNext,
  prevLabel,
  nextLabel,
  trailing,
}: PeriodNavProps) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={onPrev}
        disabled={!canPrev}
        aria-label={prevLabel}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-800 text-gray-300 disabled:opacity-30"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="flex-1 text-xs font-semibold text-white tabular-nums text-center min-w-0 truncate">
        {label}
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={!canNext}
        aria-label={nextLabel}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-800 text-gray-300 disabled:opacity-30"
      >
        <ChevronRight size={16} />
      </button>
      {trailing}
    </div>
  );
}
