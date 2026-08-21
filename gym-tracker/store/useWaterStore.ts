"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WaterEntry, WaterStore } from "@/types";
import { WATER_GOAL_ML, WATER_SIP_ML } from "@/lib/waterUtils";

export const useWaterStore = create<WaterStore>()(
  persist(
    (set, get) => ({
      goalMl: WATER_GOAL_ML,
      logs: {},
      addSip: (date, ml = WATER_SIP_ML) => {
        const entry: WaterEntry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          ml,
          at: new Date().toISOString(),
        };
        const current = get().logs[date] ?? [];
        set({
          logs: {
            ...get().logs,
            [date]: [...current, entry],
          },
        });
      },
      undoLast: (date) => {
        const current = get().logs[date] ?? [];
        if (current.length === 0) return;
        set({
          logs: {
            ...get().logs,
            [date]: current.slice(0, -1),
          },
        });
      },
      getIntake: (date) => {
        const entries = get().logs[date] ?? [];
        return entries.reduce((sum, entry) => sum + entry.ml, 0);
      },
    }),
    { name: "gym-tracker-water" }
  )
);
