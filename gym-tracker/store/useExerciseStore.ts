"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ExerciseStore } from "@/types";
import { getCloudOwnerId } from "@/lib/sync/owner";
import { localPersistRange, pickKeyRange } from "@/lib/periodUtils";

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
      hydrate: (logs) => set({ logs }),
    }),
    {
      name: "gym-tracker-logs",
      partialize: (state) => {
        if (!getCloudOwnerId()) return { logs: state.logs };
        const { startKey, endKey } = localPersistRange();
        return { logs: pickKeyRange(state.logs, startKey, endKey) };
      },
    }
  )
);
