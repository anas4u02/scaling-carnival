"use client";

import { useCallback } from "react";
import { useExerciseStore } from "@/store/useExerciseStore";
import { getTodayKey } from "@/lib/dateUtils";

export function useToggleExercise() {
  const toggle = useExerciseStore((s) => s.toggle);
  const today = getTodayKey();

  const toggleExercise = useCallback(
    (exerciseId: string) => {
      toggle(exerciseId, today);
    },
    [toggle, today]
  );

  return toggleExercise;
}
