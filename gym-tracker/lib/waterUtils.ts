import { format, subDays } from "date-fns";
import type { WaterDayPoint, WaterEntry } from "@/types";

/** 250 ml is a standard glass / sip size. */
export const WATER_SIP_ML = 250;

/**
 * Beverage target for a 23-year-old male.
 * IOM adequate intake for men 19–30 is 3.7 L total water; ~80% from drinks ≈ 3.0 L.
 */
export const WATER_GOAL_ML = 3000;

export const USER_AGE_YEARS = 23;

/** Local-time reminder hours, inclusive. Last slot is 11 PM. */
export const WATER_REMINDER_HOURS = [9, 11, 13, 15, 17, 19, 21, 23] as const;

export const MORNING_REMINDER_HOUR = 9;

export function glassesFor(ml: number): number {
  return Math.round(ml / WATER_SIP_ML);
}

export function formatMlAsLiters(ml: number): string {
  const liters = ml / 1000;
  const two = liters.toFixed(2);
  if (two.endsWith("00")) return `${liters.toFixed(1)} L`;
  if (two.endsWith("0")) return `${liters.toFixed(1)} L`;
  return `${two} L`;
}

export function waterFillPct(intakeMl: number, goalMl: number): number {
  if (goalMl <= 0) return 0;
  return Math.min(100, Math.round((intakeMl / goalMl) * 100));
}

export function remainingMl(intakeMl: number, goalMl: number): number {
  return Math.max(0, goalMl - intakeMl);
}

export function isWaterGoalMet(intakeMl: number, goalMl: number): boolean {
  return intakeMl >= goalMl;
}

export function waterReminderKey(dateKey: string, hour: number): string {
  return `${dateKey}-${hour}`;
}

/** Latest reminder hour that has already started today, or null before 9 AM. */
export function dueWaterHour(now: Date): number | null {
  const minutes = now.getHours() * 60 + now.getMinutes();
  let due: number | null = null;
  for (const hour of WATER_REMINDER_HOURS) {
    if (minutes >= hour * 60) due = hour;
  }
  return due;
}

export function nextWaterReminderAt(now: Date, goalMet: boolean): Date | null {
  if (goalMet) return null;
  for (const hour of WATER_REMINDER_HOURS) {
    const slot = new Date(now);
    slot.setHours(hour, 0, 0, 0);
    if (slot.getTime() > now.getTime()) return slot;
  }
  return null;
}

export function nextMorningReminderAt(now: Date): Date {
  const slot = new Date(now);
  slot.setHours(MORNING_REMINDER_HOUR, 0, 0, 0);
  if (slot.getTime() <= now.getTime()) {
    slot.setDate(slot.getDate() + 1);
  }
  return slot;
}

export function compactLiters(ml: number): string {
  if (ml <= 0) return "";
  const n = ml / 1000;
  if (ml % 1000 === 0) return String(n);
  if (ml % 100 === 0) return n.toFixed(1);
  return n.toFixed(2).replace(/0$/, "");
}

export function getWaterDaysForWeek(
  logs: Record<string, WaterEntry[]>,
  dateKeys: string[],
  todayKey: string
): WaterDayPoint[] {
  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];
  return dateKeys.map((date) => {
    const d = new Date(`${date}T00:00:00`);
    const ml = (logs[date] ?? []).reduce((sum, entry) => sum + entry.ml, 0);
    return {
      date,
      ml: date > todayKey ? 0 : ml,
      label: dayLabels[d.getDay()],
      isFuture: date > todayKey,
    };
  });
}

export function getLast7WaterDays(
  logs: Record<string, WaterEntry[]>,
  now = new Date()
): WaterDayPoint[] {
  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];
  return Array.from({ length: 7 }, (_, i) => {
    const d = subDays(now, 6 - i);
    const date = format(d, "yyyy-MM-dd");
    const ml = (logs[date] ?? []).reduce((sum, entry) => sum + entry.ml, 0);
    return { date, ml, label: dayLabels[d.getDay()] };
  });
}
