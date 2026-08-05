"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PhaseStore } from "@/types";

export const usePhaseStore = create<PhaseStore>()(
  persist(
    (set) => ({
      currentPhase: 1,
      setPhase: (phase) => set({ currentPhase: phase }),
    }),
    { name: "gym-tracker-phase" }
  )
);
