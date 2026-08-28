"use client";

import { format, subDays } from "date-fns";
import { useExerciseStore } from "./useExerciseStore";
import { useHistoryCacheStore } from "./useHistoryCacheStore";
import { localPersistRange } from "@/lib/periodUtils";

export function useHistoryStore() {
  const logs = useExerciseStore((s) => s.logs);
  const cacheCounts = useHistoryCacheStore((s) => s.exerciseCounts);
  const loadedDates = useHistoryCacheStore((s) => s.loadedDates);

  const getStreak = (): number => {
    const persist = localPersistRange();
    let streak = 0;
    let d = new Date();
    for (let i = 0; i < 365; i++) {
      const key = format(d, "yyyy-MM-dd");
      let count: number;
      if (key >= persist.startKey && key <= persist.endKey) {
        count = Object.values(logs[key] ?? {}).filter(Boolean).length;
      } else if (loadedDates[key]) {
        count = cacheCounts[key] ?? 0;
      } else if (logs[key]) {
        count = Object.values(logs[key]).filter(Boolean).length;
      } else {
        break;
      }
      if (count > 0) {
        streak++;
        d = subDays(d, 1);
      } else {
        break;
      }
    }
    return streak;
  };

  return { getStreak };
}
