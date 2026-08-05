"use client";

import { format, subDays } from "date-fns";
import { useExerciseStore } from "./useExerciseStore";

// History is derived from exercise logs — not stored separately.
export function useHistoryStore() {
  const logs = useExerciseStore((s) => s.logs);

  const getStreak = (): number => {
    let streak = 0;
    let d = new Date();
    for (let i = 0; i < 365; i++) {
      const key = format(d, "yyyy-MM-dd");
      const count = Object.values(logs[key] ?? {}).filter(Boolean).length;
      if (count > 0) {
        streak++;
        d = subDays(d, 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const getLast7Days = (): { date: string; count: number; label: string }[] => {
    const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];
    return Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      const date = format(d, "yyyy-MM-dd");
      const count = Object.values(logs[date] ?? {}).filter(Boolean).length;
      return { date, count, label: dayLabels[d.getDay()] };
    });
  };

  return { getStreak, getLast7Days };
}
