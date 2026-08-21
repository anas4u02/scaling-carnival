"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Star } from "lucide-react";
import { CheckCircle } from "@/components/ui/CheckCircle";
import { ExerciseMediaBlock } from "@/components/exercise/ExerciseMediaBlock";
import type { ExerciseCardProps, GymExercise } from "@/types";

export function ExerciseCard({
  exercise,
  isCompleted,
  onToggle,
  showPhaseBadge = false,
  expandedId,
  onExpand,
}: ExerciseCardProps) {
  // Local expanded state if no external accordion control provided
  const [localExpanded, setLocalExpanded] = useState(false);

  const isExpanded =
    onExpand !== undefined ? expandedId === exercise.id : localExpanded;

  const handleExpand = () => {
    if (onExpand) {
      onExpand(isExpanded ? null : exercise.id);
    } else {
      setLocalExpanded((prev) => !prev);
    }
  };

  const gymEx = exercise.category === "gym" ? (exercise as GymExercise) : null;

  const detail =
    exercise.category === "gym" && gymEx
      ? `${gymEx.sets} sets × ${gymEx.reps}`
      : "detail" in exercise
      ? exercise.detail
      : "";

  return (
    <div
      className={`rounded-xl border mb-2 overflow-hidden transition-all duration-200 ${
        isCompleted
          ? "border-emerald-600/30 bg-emerald-950/20"
          : "border-gray-700/60 bg-gray-800/40"
      }`}
    >
      {/* Row */}
      <div className="flex items-center px-3 py-2.5 gap-3">
        <CheckCircle
          checked={isCompleted}
          onToggle={() => onToggle(exercise.id)}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            {exercise.priority && (
              <Star
                size={10}
                className="text-amber-400 fill-amber-400 flex-shrink-0"
              />
            )}
            <span
              className={`text-sm font-medium leading-snug ${
                isCompleted ? "text-gray-500 line-through" : "text-white"
              }`}
            >
              {exercise.name}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {detail && (
              <span className="text-xs text-gray-400">{detail}</span>
            )}
            {showPhaseBadge && gymEx && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-700/80 text-gray-400">
                Ph {gymEx.phase}
                {gymEx.maxPhase > gymEx.phase ? `–${gymEx.maxPhase}` : ""}
              </span>
            )}
          </div>
        </div>

        {(exercise.note || exercise.media) && (
          <button
            onClick={handleExpand}
            id={`expand-${exercise.id}`}
            className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
              isExpanded ? "bg-gray-600" : "bg-gray-700 hover:bg-gray-600"
            }`}
            aria-label={isExpanded ? "Collapse details" : "Expand details"}
          >
            {isExpanded ? (
              <ChevronUp size={12} className="text-gray-300" />
            ) : (
              <ChevronDown size={12} className="text-gray-300" />
            )}
          </button>
        )}
      </div>

      {/* Expanded note + form media */}
      {isExpanded && (exercise.note || exercise.media) && (
        <div className="px-3 pb-3">
          {exercise.note && (
            <div className="text-xs text-gray-400 bg-gray-900/60 rounded-lg p-2.5 leading-relaxed border border-gray-700/30">
              {exercise.note}
            </div>
          )}
          {exercise.media && (
            <ExerciseMediaBlock media={exercise.media} title={exercise.name} />
          )}
        </div>
      )}
    </div>
  );
}
