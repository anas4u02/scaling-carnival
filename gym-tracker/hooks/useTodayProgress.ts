"use client";

import { useMemo } from "react";
import { useExerciseStore } from "@/store/useExerciseStore";
import { getTodayKey } from "@/lib/dateUtils";
import { dailyExercises } from "@/data/exercises/daily";

export function useTodayProgress(): { done: number; total: number } {
  const getLog = useExerciseStore((s) => s.getLog);
  const today = getTodayKey();
  const log = getLog(today);

  return useMemo(() => {
    const total = dailyExercises.length;
    const done = dailyExercises.filter((e) => log[e.id]).length;
    return { done, total };
  }, [log]);
}
