"use client";

import { useEffect, useRef } from "react";
import { format, subDays } from "date-fns";
import { dailyExercises } from "@/data";
import {
  morningReminderPayload,
  notificationPermission,
  showAppNotification,
  streakReminderPayload,
  waterReminderPayload,
} from "@/lib/notifications";
import { whenStoresHydrated } from "@/lib/sync/cloudSync";
import {
  MORNING_REMINDER_HOUR,
  dueWaterHour,
  isWaterGoalMet,
  nextMorningReminderAt,
  nextWaterReminderAt,
  waterReminderKey,
} from "@/lib/waterUtils";
import { useExerciseStore } from "@/store/useExerciseStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useWaterStore } from "@/store/useWaterStore";

const MAX_WAIT_MS = 60 * 60 * 1000;
const POLL_MS = 60 * 1000;
const HYDRATE_TIMEOUT_MS = 2500;

function waitForPersistHydration(): Promise<void> {
  return Promise.race([
    whenStoresHydrated(),
    new Promise<void>((resolve) => {
      window.setTimeout(resolve, HYDRATE_TIMEOUT_MS);
    }),
  ]);
}

async function fireDueNotifications(now: Date): Promise<Date> {
  const settings = useSettingsStore.getState();
  const dateKey = format(now, "yyyy-MM-dd");
  const yesterdayKey = format(subDays(now, 1), "yyyy-MM-dd");

  if (notificationPermission() !== "granted") {
    return nextWakeAt(now, false);
  }

  const intake = useWaterStore.getState().getIntake(dateKey);
  const goalMl = useWaterStore.getState().goalMl;
  const goalMet = isWaterGoalMet(intake, goalMl);

  if (settings.waterReminders && !goalMet) {
    const hour = dueWaterHour(now);
    if (hour !== null) {
      const key = waterReminderKey(dateKey, hour);
      if (settings.lastWaterReminderKey !== key) {
        await showAppNotification(waterReminderPayload(intake, goalMl));
        useSettingsStore.getState().markWaterReminder(key);
      }
    }
  }

  if (settings.morningReminder && now.getHours() >= MORNING_REMINDER_HOUR) {
    if (settings.lastMorningReminderDate !== dateKey) {
      const log = useExerciseStore.getState().logs[dateKey] ?? {};
      const morningLeft = dailyExercises
        .filter((ex) => ex.section === "morning")
        .some((ex) => !log[ex.id]);
      if (morningLeft) {
        await showAppNotification(morningReminderPayload());
      }
      useSettingsStore.getState().markMorningReminder(dateKey);
    }
  }

  if (settings.streakReminder && now.getHours() >= MORNING_REMINDER_HOUR) {
    if (settings.lastStreakReminderDate !== dateKey) {
      const logs = useExerciseStore.getState().logs;
      const yesterdayLog = logs[yesterdayKey] ?? {};
      const yesterdayCount = Object.values(yesterdayLog).filter(Boolean).length;
      const hadPriorActivity = Object.keys(logs).some(
        (key) => key < dateKey && Object.values(logs[key] ?? {}).some(Boolean)
      );
      if (hadPriorActivity && yesterdayCount === 0) {
        await showAppNotification(streakReminderPayload());
      }
      useSettingsStore.getState().markStreakReminder(dateKey);
    }
  }

  const latestIntake = useWaterStore.getState().getIntake(dateKey);
  return nextWakeAt(now, isWaterGoalMet(latestIntake, goalMl));
}

function nextWakeAt(now: Date, waterGoalMet: boolean): Date {
  const candidates: Date[] = [];
  const waterNext = nextWaterReminderAt(now, waterGoalMet);
  if (waterNext) candidates.push(waterNext);
  candidates.push(nextMorningReminderAt(now));

  candidates.sort((a, b) => a.getTime() - b.getTime());
  return candidates[0] ?? nextMorningReminderAt(now);
}

export function useNotificationScheduler(): void {
  const timerRef = useRef<number | null>(null);
  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const clearTimer = () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const arm = (wake: Date) => {
      clearTimer();
      const delay = Math.min(
        MAX_WAIT_MS,
        Math.max(250, wake.getTime() - Date.now())
      );
      timerRef.current = window.setTimeout(run, delay);
    };

    const run = async () => {
      if (cancelled) return;
      await waitForPersistHydration();
      if (cancelled) return;
      const wake = await fireDueNotifications(new Date());
      if (cancelled) return;
      arm(wake);
    };

    void run();

    pollRef.current = window.setInterval(() => {
      void run();
    }, POLL_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") void run();
    };
    const onFocus = () => {
      void run();
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);
    window.addEventListener("gymtracker:reschedule", onFocus);

    let prevWaterFlags = `${useSettingsStore.getState().waterReminders}|${useSettingsStore.getState().morningReminder}|${useSettingsStore.getState().streakReminder}`;
    const unsubSettings = useSettingsStore.subscribe((s) => {
      const flags = `${s.waterReminders}|${s.morningReminder}|${s.streakReminder}`;
      if (flags !== prevWaterFlags) {
        prevWaterFlags = flags;
        void run();
      }
    });
    const unsubWater = useWaterStore.subscribe((s, prev) => {
      if (s.logs !== prev.logs) void run();
    });

    return () => {
      cancelled = true;
      clearTimer();
      if (pollRef.current !== null) {
        window.clearInterval(pollRef.current);
        pollRef.current = null;
      }
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("gymtracker:reschedule", onFocus);
      unsubWater();
      unsubSettings();
    };
  }, []);
}
