"use client";

import { useMemo } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { PageHeader } from "@/components/layout/PageHeader";
import { StreakCard } from "@/components/progress/StreakCard";
import { WeeklyChart } from "@/components/progress/WeeklyChart";
import { DontsList } from "@/components/progress/DontsList";
import { useExerciseStore, usePhaseStore, useHistoryStore } from "@/store";
import { dailyExercises } from "@/data";
import { getTodayKey } from "@/lib/dateUtils";

export default function ProgressPage() {
  const currentPhase = usePhaseStore((s) => s.currentPhase);
  const logs = useExerciseStore((s) => s.logs);
  const { getStreak, getLast7Days } = useHistoryStore();

  const todayKey = useMemo(() => getTodayKey(), []);
  const streak = useMemo(() => getStreak(), [logs]);
  const last7Days = useMemo(() => getLast7Days(), [logs]);

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

      <WeeklyChart days={last7Days} />

      <DontsList />
    </PageWrapper>
  );
}
