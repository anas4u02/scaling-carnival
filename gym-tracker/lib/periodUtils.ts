import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
  subDays,
} from "date-fns";

const WEEK_STARTS_ON = 0 as const; // Sunday, same as GitHub

export const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"] as const;

export type DateKey = string;

export function toDateKey(date: Date): DateKey {
  return format(date, "yyyy-MM-dd");
}

export function parseDateKey(key: DateKey): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function weekBounds(anchor: Date = new Date()): { start: Date; end: Date } {
  return {
    start: startOfWeek(anchor, { weekStartsOn: WEEK_STARTS_ON }),
    end: endOfWeek(anchor, { weekStartsOn: WEEK_STARTS_ON }),
  };
}

export function weekBoundsForOffset(offset: number, today = new Date()): {
  start: Date;
  end: Date;
} {
  const { start } = weekBounds(today);
  const shifted = addDays(start, -offset * 7);
  return weekBounds(shifted);
}

export function weekDateKeys(offset: number, today = new Date()): DateKey[] {
  const { start, end } = weekBoundsForOffset(offset, today);
  return eachDayOfInterval({ start, end }).map(toDateKey);
}

export function formatWeekRangeLabel(offset: number, today = new Date()): string {
  const { start, end } = weekBoundsForOffset(offset, today);
  if (offset === 0) return "This week";
  if (start.getMonth() === end.getMonth()) {
    return `${format(start, "d")}–${format(end, "d MMM yyyy")}`;
  }
  return `${format(start, "d MMM")} – ${format(end, "d MMM yyyy")}`;
}

export function weeksBetween(later: Date, earlier: Date): number {
  const laterStart = weekBounds(later).start.getTime();
  const earlierStart = weekBounds(earlier).start.getTime();
  return Math.max(0, Math.round((laterStart - earlierStart) / (7 * 24 * 60 * 60 * 1000)));
}

/** Dates kept in localStorage after the user has a cloud account. */
export function localPersistRange(today = new Date()): {
  startKey: DateKey;
  endKey: DateKey;
} {
  const { start, end } = weekBounds(today);
  const yesterday = subDays(today, 1);
  const from = yesterday < start ? yesterday : start;
  return { startKey: toDateKey(from), endKey: toDateKey(end) };
}

export function inKeyRange(
  key: DateKey,
  startKey: DateKey,
  endKey: DateKey
): boolean {
  return key >= startKey && key <= endKey;
}

export function pickKeyRange<T>(
  map: Record<string, T>,
  startKey: DateKey,
  endKey: DateKey
): Record<string, T> {
  const next: Record<string, T> = {};
  for (const [key, value] of Object.entries(map)) {
    if (inKeyRange(key, startKey, endKey)) next[key] = value;
  }
  return next;
}

export function monthCursor(offset: number, today = new Date()): Date {
  return new Date(today.getFullYear(), today.getMonth() - offset, 1);
}

export function monthOffsetForDate(date: Date, today = new Date()): number {
  return Math.max(
    0,
    (today.getFullYear() - date.getFullYear()) * 12 +
      (today.getMonth() - date.getMonth())
  );
}

export function formatMonthLabel(offset: number, today = new Date()): string {
  if (offset === 0) return "This month";
  return format(monthCursor(offset, today), "MMMM yyyy");
}

export type HeatmapCell = {
  date: DateKey;
  inMonth: boolean;
  isToday: boolean;
  isFuture: boolean;
};

export type HeatmapWeek = HeatmapCell[];

export function monthHeatmapWeeks(
  offset: number,
  today = new Date()
): HeatmapWeek[] {
  const monthStart = monthCursor(offset, today);
  const monthEnd = endOfMonth(monthStart);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: WEEK_STARTS_ON });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: WEEK_STARTS_ON });
  const todayKey = toDateKey(today);
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const weeks: HeatmapWeek[] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(
      days.slice(i, i + 7).map((day) => {
        const date = toDateKey(day);
        return {
          date,
          inMonth: day.getMonth() === monthStart.getMonth(),
          isToday: date === todayKey,
          isFuture: date > todayKey,
        };
      })
    );
  }
  return weeks;
}

export function heatmapRange(offset: number, today = new Date()): {
  startKey: DateKey;
  endKey: DateKey;
} {
  const weeks = monthHeatmapWeeks(offset, today);
  const first = weeks[0]?.[0]?.date;
  const last = weeks[weeks.length - 1]?.[6]?.date;
  return {
    startKey: first ?? toDateKey(today),
    endKey: last ?? toDateKey(today),
  };
}

export function dateKeysBetween(startKey: DateKey, endKey: DateKey): DateKey[] {
  return eachDayOfInterval({
    start: parseDateKey(startKey),
    end: parseDateKey(endKey),
  }).map(toDateKey);
}

export function streakLookbackRange(today = new Date()): {
  startKey: DateKey;
  endKey: DateKey;
} {
  return {
    startKey: toDateKey(subDays(today, 120)),
    endKey: toDateKey(today),
  };
}
