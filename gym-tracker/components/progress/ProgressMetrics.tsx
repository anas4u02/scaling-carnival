"use client";

import { WeeklyChart } from "@/components/progress/WeeklyChart";
import { MonthHeatmap } from "@/components/progress/MonthHeatmap";
import { HistoryChartCard } from "@/components/progress/HistoryChartCard";
import { useExerciseStore } from "@/store";
import { useHistoryCacheStore } from "@/store/useHistoryCacheStore";
import { useHistoryPeriod } from "@/hooks/useHistoryPeriod";
import { DAY_LABELS, parseDateKey } from "@/lib/periodUtils";

function exerciseCountFromLogs(
  logs: Record<string, Record<string, boolean>>,
  date: string
): number {
  return Object.values(logs[date] ?? {}).filter(Boolean).length;
}

export function ProgressMetrics() {
  const period = useHistoryPeriod({ includeStreakLookback: true });
  const logs = useExerciseStore((s) => s.logs);
  const cacheCounts = useHistoryCacheStore((s) => s.exerciseCounts);

  const countFor = (date: string): number => {
    if (
      date >= period.persistRange.startKey &&
      date <= period.persistRange.endKey
    ) {
      return exerciseCountFromLogs(logs, date);
    }
    return cacheCounts[date] ?? exerciseCountFromLogs(logs, date);
  };

  const weekDays = period.weekKeys.map((date) => {
    const d = parseDateKey(date);
    return {
      date,
      count: date > period.todayKey ? 0 : countFor(date),
      label: DAY_LABELS[d.getDay()],
      isFuture: date > period.todayKey,
    };
  });

  const heatmapValues: Record<string, number> = {};
  for (const week of period.monthWeeks) {
    for (const cell of week) {
      heatmapValues[cell.date] = cell.isFuture ? 0 : countFor(cell.date);
    }
  }

  return (
    <HistoryChartCard
      title="Activity"
      view={period.view}
      weekLabel={period.weekLabel}
      monthLabel={period.monthLabel}
      weekOffset={period.weekOffset}
      monthOffset={period.monthOffset}
      showSignInHint={period.showSignInHint}
      loginNext="/login?next=/progress"
      error={period.error}
      signedIn={period.signedIn}
      loading={period.loading}
      onToggleView={period.toggleView}
      onWeekPrev={() => period.setWeekOffset((n) => n + 1)}
      onWeekNext={() => period.setWeekOffset((n) => Math.max(0, n - 1))}
      onMonthPrev={() => period.setMonthOffset((n) => n + 1)}
      onMonthNext={() => period.setMonthOffset((n) => Math.max(0, n - 1))}
    >
      {period.view === "month" ? (
        <MonthHeatmap
          weeks={period.monthWeeks}
          values={heatmapValues}
          onSelectDate={period.selectDate}
          tone="activity"
          unitLabel="exercises"
        />
      ) : (
        <WeeklyChart days={weekDays} />
      )}
    </HistoryChartCard>
  );
}
