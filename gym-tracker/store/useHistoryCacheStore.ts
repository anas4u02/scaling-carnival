"use client";

import { create } from "zustand";
import { dateKeysBetween } from "@/lib/periodUtils";
import { fetchMetricsRange } from "@/lib/sync/fetchHistory";
import { useExerciseStore } from "./useExerciseStore";
import { useWaterStore } from "./useWaterStore";

type HistoryCacheState = {
  exerciseCounts: Record<string, number>;
  waterMl: Record<string, number>;
  loadedDates: Record<string, true>;
  loading: boolean;
  error: string | null;
  ensureRange: (fromKey: string, toKey: string) => Promise<void>;
  seedFromLocal: (fromKey: string, toKey: string) => void;
  clear: () => void;
};

const inflight = new Map<string, Promise<void>>();

function countExercises(day: Record<string, boolean> | undefined): number {
  return Object.values(day ?? {}).filter(Boolean).length;
}

function sumWater(
  entries: Array<{ ml: number }> | undefined
): number {
  return (entries ?? []).reduce((sum, entry) => sum + entry.ml, 0);
}

export const useHistoryCacheStore = create<HistoryCacheState>((set, get) => ({
  exerciseCounts: {},
  waterMl: {},
  loadedDates: {},
  loading: false,
  error: null,

  clear: () =>
    set({
      exerciseCounts: {},
      waterMl: {},
      loadedDates: {},
      loading: false,
      error: null,
    }),

  seedFromLocal: (fromKey, toKey) => {
    const logs = useExerciseStore.getState().logs;
    const water = useWaterStore.getState().logs;
    const exerciseCounts = { ...get().exerciseCounts };
    const waterMl = { ...get().waterMl };
    const loadedDates = { ...get().loadedDates };
    for (const key of dateKeysBetween(fromKey, toKey)) {
      exerciseCounts[key] = countExercises(logs[key]);
      waterMl[key] = sumWater(water[key]);
      loadedDates[key] = true;
    }
    set({ exerciseCounts, waterMl, loadedDates });
  },

  ensureRange: async (fromKey, toKey) => {
    const { loadedDates } = get();
    const needed = dateKeysBetween(fromKey, toKey).filter((key) => !loadedDates[key]);
    if (needed.length === 0) return;

    const fetchFrom = needed[0];
    const fetchTo = needed[needed.length - 1];
    const inflightKey = `${fetchFrom}_${fetchTo}`;
    const existing = inflight.get(inflightKey);
    if (existing) {
      await existing;
      return;
    }

    const run = (async () => {
      set({ loading: true, error: null });
      try {
        const remote = await fetchMetricsRange(fetchFrom, fetchTo);
        const keys = dateKeysBetween(fetchFrom, fetchTo);
        if (!remote) {
          get().seedFromLocal(fetchFrom, fetchTo);
          set({ loading: false });
          return;
        }
        set((state) => {
          const exerciseCounts = { ...state.exerciseCounts };
          const waterMl = { ...state.waterMl };
          const nextLoaded = { ...state.loadedDates };
          for (const key of keys) {
            exerciseCounts[key] = remote.exerciseCounts[key] ?? 0;
            waterMl[key] = remote.waterMl[key] ?? 0;
            nextLoaded[key] = true;
          }
          return {
            exerciseCounts,
            waterMl,
            loadedDates: nextLoaded,
            loading: false,
            error: null,
          };
        });
      } catch (err) {
        get().seedFromLocal(fetchFrom, fetchTo);
        set({
          loading: false,
          error: err instanceof Error ? err.message : "Could not load history",
        });
      } finally {
        inflight.delete(inflightKey);
      }
    })();

    inflight.set(inflightKey, run);
    await run;
  },
}));

export function liveExerciseCount(dateKey: string): number {
  const day = useExerciseStore.getState().logs[dateKey];
  return Object.values(day ?? {}).filter(Boolean).length;
}

export function liveWaterMl(dateKey: string): number {
  const entries = useWaterStore.getState().logs[dateKey] ?? [];
  return entries.reduce((sum, entry) => sum + entry.ml, 0);
}
