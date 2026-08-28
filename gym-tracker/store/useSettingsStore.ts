"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SettingsStore } from "@/types";

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      waterReminders: true,
      morningReminder: true,
      streakReminder: true,
      lastWaterReminderKey: null,
      lastMorningReminderDate: null,
      lastStreakReminderDate: null,
      setWaterReminders: (on) => set({ waterReminders: on }),
      setMorningReminder: (on) => set({ morningReminder: on }),
      setStreakReminder: (on) => set({ streakReminder: on }),
      markWaterReminder: (key) => set({ lastWaterReminderKey: key }),
      markMorningReminder: (date) => set({ lastMorningReminderDate: date }),
      markStreakReminder: (date) => set({ lastStreakReminderDate: date }),
      hydrateReminders: (prefs) => set(prefs),
    }),
    { name: "gym-tracker-settings" }
  )
);
