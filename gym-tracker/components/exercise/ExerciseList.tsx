"use client";

import { useState } from "react";
import { ExerciseCard } from "./ExerciseCard";
import type { ExerciseListProps, AnyExercise } from "@/types";

function sortExercises(exercises: AnyExercise[]): AnyExercise[] {
  return [...exercises].sort((a, b) => {
    if (a.priority !== b.priority) return a.priority ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

export function ExerciseList({
  exercises,
  completionMap,
  onToggle,
  emptyMessage = "No exercises available.",
  showPhaseBadge = false,
}: ExerciseListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (exercises.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 text-sm">
        {emptyMessage}
      </div>
    );
  }

  const sorted = sortExercises(exercises);

  return (
    <div>
      {sorted.map((exercise) => (
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
          isCompleted={!!completionMap[exercise.id]}
          onToggle={onToggle}
          showPhaseBadge={showPhaseBadge}
          expandedId={expandedId}
          onExpand={setExpandedId}
        />
      ))}
    </div>
  );
}
