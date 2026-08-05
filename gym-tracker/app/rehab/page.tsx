"use client";

import { useState, useMemo } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConditionTabs } from "@/components/rehab/ConditionTabs";
import { ExerciseList } from "@/components/exercise/ExerciseList";
import { rehabExercises } from "@/data";
import { useExerciseStore, usePhaseStore } from "@/store";
import { getTodayKey } from "@/lib/dateUtils";
import type { RehabCondition } from "@/types";

export default function RehabPage() {
  const [selectedCondition, setSelectedCondition] = useState<RehabCondition>("neck");
  const currentPhase = usePhaseStore((s) => s.currentPhase);
  const logs = useExerciseStore((s) => s.logs);
  const toggle = useExerciseStore((s) => s.toggle);

  const todayKey = useMemo(() => getTodayKey(), []);
  const todayLogs = logs[todayKey] ?? {};

  const filteredExercises = useMemo(() => {
    return rehabExercises.filter((ex) => ex.condition === selectedCondition);
  }, [selectedCondition]);

  return (
    <PageWrapper>
      <PageHeader
        title="Physical Therapy"
        subtitle="Spine & posture rehabilitation"
        phase={currentPhase}
      />

      <ConditionTabs selected={selectedCondition} onChange={setSelectedCondition} />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white capitalize tracking-wide">
            {selectedCondition === "lowerBack" ? "Lower Back" : selectedCondition} Protocol ({filteredExercises.length})
          </h2>
        </div>

        <ExerciseList
          exercises={filteredExercises}
          completionMap={todayLogs}
          onToggle={(id) => toggle(id, todayKey)}
        />
      </div>
    </PageWrapper>
  );
}
