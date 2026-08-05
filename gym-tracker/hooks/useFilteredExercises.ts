"use client";

import { useMemo } from "react";
import type { GymExercise, MuscleGroup, PhaseNumber } from "@/types";
import { gymExercises } from "@/data/exercises/gym";
import { usePhaseStore } from "@/store/usePhaseStore";

export function useFilteredExercises(
  muscle: MuscleGroup,
  currentPhaseParam?: PhaseNumber
): GymExercise[] {
  const storePhase = usePhaseStore((s) => s.currentPhase);
  const currentPhase = currentPhaseParam ?? storePhase;

  return useMemo(() => {
    const exercises = gymExercises[muscle] ?? [];
    const filtered = exercises.filter((ex) => ex.phase <= currentPhase);
    return [...filtered].sort((a, b) => {
      if (a.priority !== b.priority) return a.priority ? -1 : 1;
      if (a.phase !== b.phase) return a.phase - b.phase;
      return a.name.localeCompare(b.name);
    });
  }, [muscle, currentPhase]);
}
