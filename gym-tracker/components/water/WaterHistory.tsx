"use client";

import { WaterWeeklyChart } from "@/components/progress/WaterWeeklyChart";
import { MonthHeatmap } from "@/components/progress/MonthHeatmap";
import { HistoryChartCard } from "@/components/progress/HistoryChartCard";
import { useWaterStore } from "@/store";
import { useHistoryCacheStore } from "@/store/useHistoryCacheStore";
import { useHistoryPeriod } from "@/hooks/useHistoryPeriod";
import { DAY_LABELS, parseDateKey } from "@/lib/periodUtils";
import type { WaterDayPoint } from "@/types";

function waterMlFromLogs(
  logs: Record<string, Array<{ ml: number }>>,
  date: string
): number {
  return (logs[date] ?? []).reduce((sum, entry) => sum + entry.ml, 0);
}

export function WaterHistory() {
  const period = useHistoryPeriod();
  const waterLogs = useWaterStore((s) => s.logs);
  const goalMl = useWaterStore((s) => s.goalMl);
  const cacheWater = useHistoryCacheStore((s) => s.waterMl);

  const waterFor = (date: string): number => {
    if (
      date >= period.persistRange.startKey &&
      date <= period.persistRange.endKey
    ) {
      return waterMlFromLogs(waterLogs, date);
    }
    return cacheWater[date] ?? waterMlFromLogs(waterLogs, date);
  };

  const waterDays: WaterDayPoint[] = period.weekKeys.map((date) => {
    const d = parseDateKey(date);
    return {
      date,
      ml: date > period.todayKey ? 0 : waterFor(date),
      label: DAY_LABELS[d.getDay()],
      isFuture: date > period.todayKey,
    };
  });

  const heatmapValues: Record<string, number> = {};
  for (const week of period.monthWeeks) {
    for (const cell of week) {
      heatmapValues[cell.date] = cell.isFuture ? 0 : waterFor(cell.date);
    }
  }

  return (
    <HistoryChartCard
      title="Intake"
      view={period.view}
      weekLabel={period.weekLabel}
      monthLabel={period.monthLabel}
      weekOffset={period.weekOffset}
      monthOffset={period.monthOffset}
      showSignInHint={period.showSignInHint}
      loginNext="/login?next=/water"
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
          tone="water"
          goalMl={goalMl}
          unitLabel="ml"
        />
      ) : (
        <WaterWeeklyChart
          days={waterDays}
          goalMl={goalMl}
          todayKey={period.todayKey}
        />
      )}
    </HistoryChartCard>
  );
}
