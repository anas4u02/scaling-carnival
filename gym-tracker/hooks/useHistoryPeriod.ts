"use client";

import { useEffect, useMemo, useState } from "react";
import { useHistoryCacheStore } from "@/store/useHistoryCacheStore";
import { useSyncStore } from "@/store/useSyncStore";
import { getTodayKey } from "@/lib/dateUtils";
import {
  formatMonthLabel,
  formatWeekRangeLabel,
  heatmapRange,
  localPersistRange,
  monthHeatmapWeeks,
  monthOffsetForDate,
  parseDateKey,
  streakLookbackRange,
  weekBoundsForOffset,
  weekDateKeys,
  weeksBetween,
} from "@/lib/periodUtils";

export type HistoryView = "week" | "month";

export function useHistoryPeriod(options?: { includeStreakLookback?: boolean }) {
  const includeStreakLookback = options?.includeStreakLookback ?? false;
  const [view, setView] = useState<HistoryView>("week");
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);

  const todayKey = useMemo(() => getTodayKey(), []);
  const persistRange = useMemo(() => localPersistRange(), []);
  const weekKeys = useMemo(() => weekDateKeys(weekOffset), [weekOffset]);
  const monthWeeks = useMemo(
    () => monthHeatmapWeeks(monthOffset),
    [monthOffset]
  );
  const monthRange = useMemo(() => heatmapRange(monthOffset), [monthOffset]);
  const lookback = useMemo(() => streakLookbackRange(), []);

  const ensureRange = useHistoryCacheStore((s) => s.ensureRange);
  const loading = useHistoryCacheStore((s) => s.loading);
  const error = useHistoryCacheStore((s) => s.error);
  const signedIn = useSyncStore((s) => s.status !== "signed-out");

  useEffect(() => {
    const ranges: Array<{ startKey: string; endKey: string }> = [persistRange];
    if (view === "month") ranges.push(monthRange);
    if (view === "week" && weekOffset > 0 && weekKeys[0] && weekKeys[6]) {
      ranges.push({ startKey: weekKeys[0], endKey: weekKeys[6] });
    }
    if (includeStreakLookback) ranges.push(lookback);

    let from = ranges[0].startKey;
    let to = ranges[0].endKey;
    for (const range of ranges) {
      if (range.startKey < from) from = range.startKey;
      if (range.endKey > to) to = range.endKey;
    }
    void ensureRange(from, to);
  }, [
    ensureRange,
    includeStreakLookback,
    lookback,
    monthRange,
    persistRange,
    signedIn,
    view,
    weekKeys,
    weekOffset,
  ]);

  const openMonth = () => {
    const { start } = weekBoundsForOffset(weekOffset);
    setMonthOffset(monthOffsetForDate(start));
    setView("month");
  };

  const closeMonth = () => setView("week");

  const toggleView = () => {
    if (view === "week") openMonth();
    else closeMonth();
  };

  const selectDate = (date: string) => {
    if (date > todayKey) return;
    setWeekOffset(weeksBetween(new Date(), parseDateKey(date)));
    setView("week");
  };

  const needsCloud =
    (view === "week" && weekOffset > 0) ||
    (view === "month" && monthOffset > 0);
  const showSignInHint = needsCloud && !signedIn;

  return {
    view,
    todayKey,
    persistRange,
    weekOffset,
    monthOffset,
    weekKeys,
    monthWeeks,
    weekLabel: formatWeekRangeLabel(weekOffset),
    monthLabel: formatMonthLabel(monthOffset),
    loading,
    error,
    signedIn,
    showSignInHint,
    setWeekOffset,
    setMonthOffset,
    toggleView,
    selectDate,
  };
}
