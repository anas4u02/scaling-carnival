"use client";

import { useMemo } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { PageHeader } from "@/components/layout/PageHeader";
import { StreakCard } from "@/components/progress/StreakCard";
import { DontsList } from "@/components/progress/DontsList";
import { NotificationSettings } from "@/components/notifications/NotificationSettings";
import { ProgressMetrics } from "@/components/progress/ProgressMetrics";
import { useExerciseStore, usePhaseStore, useHistoryStore } from "@/store";
import { useHistoryCacheStore } from "@/store/useHistoryCacheStore";
import { getTodayKey } from "@/lib/dateUtils";

export default function ProgressPage() {
  const currentPhase = usePhaseStore((s) => s.currentPhase);
  const logs = useExerciseStore((s) => s.logs);
  const cacheCounts = useHistoryCacheStore((s) => s.exerciseCounts);
  const loadedDates = useHistoryCacheStore((s) => s.loadedDates);
  const { getStreak } = useHistoryStore();

  const todayKey = useMemo(() => getTodayKey(), []);
  const streak = useMemo(
    () => getStreak(),
    [logs, cacheCounts, loadedDates, getStreak]
  );

  const todayDoneCount = useMemo(() => {
    const todayLogs = logs[todayKey] ?? {};
    return Object.values(todayLogs).filter(Boolean).length;
  }, [logs, todayKey]);

  return (
    <PageWrapper>
      <PageHeader
        title="Progress & Guidelines"
        subtitle="Track consistency and review safety protocols"
        phase={currentPhase}
      />

      <StreakCard streak={streak} todayCount={todayDoneCount} phase={currentPhase} />

      <ProgressMetrics />

      <div className="mb-4">
        <NotificationSettings />
      </div>

      <DontsList />
    </PageWrapper>
  );
}
