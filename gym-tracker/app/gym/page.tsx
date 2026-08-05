"use client";

import { useState, useMemo } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { PageHeader } from "@/components/layout/PageHeader";
import { PhaseSelector } from "@/components/gym/PhaseSelector";
import { MuscleChips } from "@/components/gym/MuscleChips";
import { FacePullReminder } from "@/components/gym/FacePullReminder";
import { ExerciseList } from "@/components/exercise/ExerciseList";
import { useExerciseStore, usePhaseStore } from "@/store";
import { useFilteredExercises } from "@/hooks/useFilteredExercises";
import { getTodayKey } from "@/lib/dateUtils";
import { PHASE_LABELS } from "@/lib/phaseUtils";
import type { MuscleGroup, PhaseNumber } from "@/types";
import { ShieldAlert, Check, X } from "lucide-react";

export default function GymPage() {
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup>("chest");
  const [pendingPhase, setPendingPhase] = useState<PhaseNumber | null>(null);

  const currentPhase = usePhaseStore((s) => s.currentPhase);
  const setPhase = usePhaseStore((s) => s.setPhase);
  const logs = useExerciseStore((s) => s.logs);
  const toggle = useExerciseStore((s) => s.toggle);

  const todayKey = useMemo(() => getTodayKey(), []);
  const todayLogs = logs[todayKey] ?? {};

  const filteredExercises = useFilteredExercises(selectedMuscle);

  const handlePhaseChange = (newPhase: PhaseNumber) => {
    if (newPhase > currentPhase) {
      setPendingPhase(newPhase);
    } else {
      setPhase(newPhase);
    }
  };

  const confirmPhaseAdvancement = () => {
    if (pendingPhase) {
      setPhase(pendingPhase);
      setPendingPhase(null);
    }
  };

  return (
    <PageWrapper>
      <PageHeader
        title="Gym Routine"
        subtitle="Phase-gated hypertrophy & strength"
        phase={currentPhase}
      />

      {/* Phase Selector */}
      <div className="mb-4">
        <PhaseSelector current={currentPhase} onChange={handlePhaseChange} />
      </div>

      {/* Muscle Group Chips */}
      <div className="mb-4">
        <MuscleChips selected={selectedMuscle} onChange={setSelectedMuscle} />
      </div>

      {/* Face pull reminder for back/shoulders */}
      {(selectedMuscle === "shoulders" || selectedMuscle === "back") && (
        <div className="mb-4">
          <FacePullReminder />
        </div>
      )}

      {/* Exercise List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white capitalize tracking-wide">
            {selectedMuscle} Exercises ({filteredExercises.length})
          </h2>
          <span className="text-[11px] text-gray-400 font-mono">
            Phase ≤ P{currentPhase}
          </span>
        </div>

        <ExerciseList
          exercises={filteredExercises}
          completionMap={todayLogs}
          onToggle={(id) => toggle(id, todayKey)}
          showPhaseBadge
          emptyMessage={`No Phase ≤ P${currentPhase} exercises found for ${selectedMuscle}.`}
        />
      </div>

      {/* Phase Advancement Modal */}
      {pendingPhase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-xs w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-white">Advance to Phase {pendingPhase}?</h3>
              <p className="text-xs text-gray-300">
                {PHASE_LABELS[pendingPhase]}. Ensure you have doctor clearance before unlocking advanced load exercises.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setPendingPhase(null)}
                className="flex-1 flex items-center justify-center gap-1 py-2.5 px-3 rounded-xl border border-gray-700 bg-gray-800 text-xs font-semibold text-gray-300 hover:bg-gray-700 transition-all"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={confirmPhaseAdvancement}
                className="flex-1 flex items-center justify-center gap-1 py-2.5 px-3 rounded-xl bg-blue-600 text-xs font-semibold text-white hover:bg-blue-500 shadow-md shadow-blue-900/40 transition-all"
              >
                <Check className="w-4 h-4" />
                Advance
              </button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
