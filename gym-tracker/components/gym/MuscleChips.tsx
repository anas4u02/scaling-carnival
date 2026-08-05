"use client";

import type { MuscleChipsProps, MuscleGroup } from "@/types";

const MUSCLES: MuscleGroup[] = [
  "chest",
  "shoulders",
  "biceps",
  "triceps",
  "back",
  "legs",
  "core",
];

const MUSCLE_LABELS: Record<MuscleGroup, string> = {
  chest: "Chest",
  shoulders: "Shoulders",
  biceps: "Biceps",
  triceps: "Triceps",
  back: "Back",
  legs: "Legs",
  core: "Core",
};

export function MuscleChips({ selected, onChange }: MuscleChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
      {MUSCLES.map((muscle) => (
        <button
          key={muscle}
          id={`muscle-chip-${muscle}`}
          onClick={() => onChange(muscle)}
          className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            selected === muscle
              ? "bg-white text-gray-900 border-white"
              : "bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500"
          }`}
        >
          {MUSCLE_LABELS[muscle]}
        </button>
      ))}
    </div>
  );
}
