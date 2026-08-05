import type { PhaseNumber } from "@/types";

export const PHASE_LABELS: Record<PhaseNumber, string> = {
  1: "Foundation",
  2: "Stability",
  3: "Strength",
  4: "Performance",
};

export const PHASE_COLORS: Record<
  PhaseNumber,
  {
    bg: string;
    softBg: string;
    border: string;
    text: string;
    badge: string;
    bar: string;
  }
> = {
  1: {
    bg: "bg-emerald-500",
    softBg: "bg-emerald-900/30",
    border: "border-emerald-500/40",
    text: "text-emerald-400",
    badge: "bg-emerald-900/50 border-emerald-600/40 text-emerald-400",
    bar: "#10b981",
  },
  2: {
    bg: "bg-blue-500",
    softBg: "bg-blue-900/30",
    border: "border-blue-500/40",
    text: "text-blue-400",
    badge: "bg-blue-900/50 border-blue-600/40 text-blue-400",
    bar: "#3b82f6",
  },
  3: {
    bg: "bg-amber-500",
    softBg: "bg-amber-900/30",
    border: "border-amber-500/40",
    text: "text-amber-400",
    badge: "bg-amber-900/50 border-amber-600/40 text-amber-400",
    bar: "#f59e0b",
  },
  4: {
    bg: "bg-purple-500",
    softBg: "bg-purple-900/30",
    border: "border-purple-500/40",
    text: "text-purple-400",
    badge: "bg-purple-900/50 border-purple-600/40 text-purple-400",
    bar: "#a855f7",
  },
};

export function isPhaseAdvancement(
  current: PhaseNumber,
  next: PhaseNumber
): boolean {
  return next > current;
}
