"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ExerciseStore } from "@/types";

export const useExerciseStore = create<ExerciseStore>()(
  persist(
    (set, get) => ({
      logs: {},
      toggle: (exerciseId, date) => {
        const currentLog = get().logs[date] ?? {};
        set({
          logs: {
            ...get().logs,
            [date]: {
              ...currentLog,
              [exerciseId]: !currentLog[exerciseId],
            },
          },
        });
      },
      getLog: (date) => get().logs[date] ?? {},
      clearDay: (date) => {
        const { [date]: _, ...rest } = get().logs;
        set({ logs: rest });
      },
    }),
    { name: "gym-tracker-logs" }
  )
);
