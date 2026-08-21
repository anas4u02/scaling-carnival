"use client";

import { useState } from "react";
import type { AnyExercise, DontItem } from "@/types";
import { CheckCircle } from "@/components/ui/CheckCircle";
import { Badge } from "@/components/ui/Badge";
import { ExerciseMediaBlock } from "@/components/exercise/ExerciseMediaBlock";
import { AlertTriangle, ChevronDown, ChevronUp, ShieldAlert } from "lucide-react";

export type SearchResultItem =
  | { type: "exercise"; exercise: AnyExercise; isCompleted: boolean; warning?: string }
  | { type: "dont"; dont: DontItem };

interface SearchResultCardProps {
  item: SearchResultItem;
  onToggleExercise?: (id: string) => void;
}

export function SearchResultCard({ item, onToggleExercise }: SearchResultCardProps) {
  const [expanded, setExpanded] = useState(false);

  if (item.type === "dont") {
    const { dont } = item;
    return (
      <div className="bg-red-950/40 border border-red-800/60 rounded-2xl p-4 mb-3 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0" />
            <h4 className="text-sm font-bold text-red-200">{dont.name}</h4>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-900/80 text-red-200 border border-red-700/50 uppercase tracking-wider">
            🚫 Don't
          </span>
        </div>
        <p className="text-xs text-red-300/80 mt-2 leading-relaxed pl-7">{dont.reason}</p>
      </div>
    );
  }

  const { exercise, isCompleted, warning } = item;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-3 shadow-sm transition-all hover:border-gray-700">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          {onToggleExercise && (
            <div className="pt-0.5">
              <CheckCircle
                checked={isCompleted}
                onToggle={() => onToggleExercise(exercise.id)}
              />
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4
                className={`text-sm font-semibold transition-all ${
                  isCompleted ? "line-through text-gray-500" : "text-white"
                }`}
              >
                {exercise.name}
              </h4>
              {exercise.priority && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Priority
                </span>
              )}
              {exercise.category === "gym" && (
                <Badge phase={exercise.phase} variant="soft" />
              )}
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-800 text-gray-400 capitalize">
                {exercise.category}
              </span>
            </div>

            {"detail" in exercise && (
              <p className="text-xs text-gray-400 mt-1">{exercise.detail}</p>
            )}

            {"sets" in exercise && exercise.sets && (
              <p className="text-xs text-blue-400 font-mono mt-1">
                {exercise.sets} sets × {exercise.reps}
              </p>
            )}

            {(exercise.note || exercise.media) && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-200 mt-2 font-medium"
              >
                <span>{expanded ? "Hide details" : "Show details"}</span>
                {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}

            {expanded && (exercise.note || exercise.media) && (
              <div className="mt-2 p-2.5 rounded-xl bg-gray-950/80 border border-gray-800 text-xs text-gray-300 leading-relaxed">
                {exercise.note}
                {exercise.media && (
                  <ExerciseMediaBlock media={exercise.media} title={exercise.name} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Matching Don't Warning Footnote */}
      {warning && (
        <div className="mt-3 pt-2.5 border-t border-amber-900/40 flex items-start gap-2 text-xs text-amber-300 bg-amber-950/30 p-2.5 rounded-xl border border-amber-800/40">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-200">Warning: </span>
            {warning}
          </div>
        </div>
      )}
    </div>
  );
}
