"use client";

import { useMemo } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { InfoBanner } from "@/components/ui/InfoBanner";
import { SectionHeader } from "@/components/exercise/SectionHeader";
import { ExerciseList } from "@/components/exercise/ExerciseList";
import { dailyExercises } from "@/data";
import { useExerciseStore, usePhaseStore } from "@/store";
import { getTodayKey, formatDisplayDate } from "@/lib/dateUtils";
import type { DailySection } from "@/types";
import { WaterGlance } from "@/components/water/WaterGlance";

export default function TodayPage() {
  const todayKey = useMemo(() => getTodayKey(), []);
  const displayDate = useMemo(() => formatDisplayDate(), []);
  const currentPhase = usePhaseStore((s) => s.currentPhase);
  const logs = useExerciseStore((s) => s.logs);
  const toggle = useExerciseStore((s) => s.toggle);

  const todayLogs = logs[todayKey] ?? {};

  const handleToggle = (id: string) => {
    toggle(id, todayKey);
  };

  const sections: { key: DailySection; title: string }[] = [
    { key: "morning", title: "Morning Routine" },
    { key: "throughout", title: "Throughout the Day" },
    { key: "evening", title: "Evening Routine" },
  ];

  const groupedExercises = useMemo(() => {
    return sections.map((sec) => {
      const items = dailyExercises.filter((ex) => ex.section === sec.key);
      const doneCount = items.filter((ex) => todayLogs[ex.id]).length;
      return {
        ...sec,
        items,
        doneCount,
        totalCount: items.length,
      };
    });
  }, [sections, todayLogs]);

  const totalDone = useMemo(() => {
    return dailyExercises.filter((ex) => todayLogs[ex.id]).length;
  }, [todayLogs]);

  return (
    <PageWrapper>
      <PageHeader
        title="Today's Routine"
        subtitle={displayDate}
        phase={currentPhase}
      />

      <div className="mb-6">
        <ProgressBar done={totalDone} total={dailyExercises.length} phase={currentPhase} />
      </div>

      <WaterGlance />

      <div className="mb-6">
        <InfoBanner
          variant="warning"
          title="Bakody's Sign Notice"
          message="Lifting your arm onto your head relieves nerve root tension (C5/C6). If experiencing acute radicular pain, use this relief position."
        />
      </div>

      <div className="space-y-6">
        {groupedExercises.map((sec) => (
          <section key={sec.key} className="space-y-3">
            <SectionHeader
              label={sec.title}
              done={sec.doneCount}
              total={sec.totalCount}
            />
            <ExerciseList
              exercises={sec.items}
              completionMap={todayLogs}
              onToggle={handleToggle}
            />
          </section>
        ))}
      </div>
    </PageWrapper>
  );
}
