"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus } from "lucide-react";
import { allExercises } from "@/data";
import { SESSION_MODE_LABEL, formatSessionMinutes, unitWord } from "@/lib/sessions/labels";
import { useSessionStore } from "@/store";
import type { SessionRecord } from "@/types";
import { SessionVideo } from "./SessionVideo";

const exerciseById = new Map(allExercises.map((exercise) => [exercise.id, exercise]));

export function SessionPlayer() {
  const router = useRouter();
  const active = useSessionStore((s) => s.active);
  const increment = useSessionStore((s) => s.increment);
  const advance = useSessionStore((s) => s.advance);
  const skip = useSessionStore((s) => s.skip);
  const endSession = useSessionStore((s) => s.endSession);
  const [hydrated, setHydrated] = useState(false);
  const [summary, setSummary] = useState<SessionRecord | null>(null);
  const summaryRef = useRef<SessionRecord | null>(null);
  const skipLock = useRef(false);
  const [confirmEnd, setConfirmEnd] = useState(false);

  useEffect(() => {
    if (useSessionStore.persist.hasHydrated()) setHydrated(true);
    return useSessionStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);

  const card = active?.cards[active.index];
  const result = active?.results[active.index];
  const completed = Boolean(result?.completed);

  useEffect(() => {
    if (!completed) return;
    const timer = setTimeout(() => {
      const finished = advance();
      if (finished) {
        summaryRef.current = finished;
        setSummary(finished);
      }
    }, 700);
    return () => clearTimeout(timer);
  }, [completed, active?.index, advance]);

  useEffect(() => {
    if (hydrated && !active && !summary && !summaryRef.current) router.replace("/today");
  }, [hydrated, active, summary, router]);

  const media = card ? exerciseById.get(card.exerciseId)?.media : undefined;
  const remaining = useMemo(() => {
    if (!active) return [];
    return active.results.filter((item, index) => index >= active.index && !item.completed);
  }, [active]);

  if (!hydrated) {
    return <div className="fixed inset-0 z-40 bg-gray-950" />;
  }

  if (summary) {
    return (
      <div className="fixed inset-0 z-40 overflow-y-auto bg-gray-950">
        <div className="mx-auto flex min-h-full w-full max-w-md flex-col px-4 py-6">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            {SESSION_MODE_LABEL[summary.mode]}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-white">
            {summary.status === "completed" ? "Session complete" : "Session saved"}
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            {formatSessionMinutes(summary.startedAt, summary.endedAt)}
          </p>
          <ul className="mt-6 space-y-2">
            {summary.exercises.map((exercise) => (
              <li
                key={exercise.movementId}
                className="flex items-center justify-between gap-3 rounded-xl border border-gray-800 bg-gray-900/60 px-3 py-2.5"
              >
                <span className="text-sm text-white">{exercise.name}</span>
                <span className="text-[11px] text-gray-400">
                  {exercise.completed
                    ? `${exercise.done} ${unitWord(exercise.unit, exercise.done)}`
                    : exercise.skipped
                      ? "Skipped"
                      : "Not reached"}
                </span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => router.push("/today")}
            className="mt-8 rounded-2xl bg-blue-600 py-3 text-sm font-semibold text-white"
          >
            Back to today
          </button>
        </div>
      </div>
    );
  }

  if (!active || !card || !result) return <div className="fixed inset-0 z-40 bg-gray-950" />;

  const doneCount = active.results.filter((item) => item.completed).length;

  return (
    <div className="fixed inset-0 z-40 bg-gray-950">
      <div className="mx-auto flex h-full w-full max-w-md flex-col px-4 pt-4 pb-6">
        <header className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              if (skipLock.current) return;
              skipLock.current = true;
              window.setTimeout(() => {
                skipLock.current = false;
              }, 400);
              const finished = skip();
              if (finished) {
                summaryRef.current = finished;
                setSummary(finished);
              }
            }}
            className="text-[11px] text-gray-600"
          >
            Skip
          </button>
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-wide text-gray-500">
              {SESSION_MODE_LABEL[active.mode]}
            </p>
            <p className="text-xs text-gray-300 tabular-nums">
              {active.index + 1} of {active.cards.length}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setConfirmEnd(true)}
            className="text-sm text-gray-300"
          >
            End
          </button>
        </header>

        <div className="mt-3 h-1 overflow-hidden rounded-full bg-gray-800">
          <div
            className="h-full bg-emerald-500 transition-all"
            style={{ width: `${(doneCount / active.cards.length) * 100}%` }}
          />
        </div>

        <div className="mt-4 flex-1 overflow-y-auto pb-4">
          <SessionVideo media={media} title={card.name} resetKey={card.movementId} />
          <div className="mt-4 flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">{card.name}</h1>
            {card.layer === "beneficial" && (
              <span className="rounded-full border border-gray-700 px-2 py-0.5 text-[10px] uppercase tracking-wide text-gray-400">
                Extra
              </span>
            )}
          </div>
          <p className="mt-1 text-sm font-medium text-blue-300">{card.dose}</p>
          {card.note && <p className="mt-3 text-sm leading-relaxed text-gray-400">{card.note}</p>}
        </div>

        <div className="flex shrink-0 flex-col items-center pt-2">
          <p className="mb-3 text-sm tabular-nums text-gray-300">
            {result.done} / {result.target} {unitWord(card.unit, result.target)}
          </p>
          <button
            type="button"
            onClick={increment}
            disabled={completed}
            aria-label={completed ? "Round complete" : `Log one ${unitWord(card.unit, 1)}`}
            className={`flex h-20 w-20 items-center justify-center rounded-full text-white shadow-lg transition ${
              completed ? "bg-emerald-600" : "bg-blue-600 active:scale-95"
            }`}
          >
            {completed ? <Check size={32} /> : <Plus size={32} />}
          </button>
        </div>
      </div>

      {confirmEnd && (
        <div className="absolute inset-0 z-10 flex items-end justify-center bg-black/70 px-4 pb-6">
          <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 p-4">
            <h2 className="text-base font-semibold text-white">End this session?</h2>
            <p className="mt-1 text-sm text-gray-400">What you already finished stays saved.</p>
            {remaining.length > 0 && (
              <ul className="mt-3 max-h-40 space-y-1 overflow-y-auto text-sm text-gray-300">
                {remaining.map((item) => (
                  <li key={item.movementId}>{item.name}</li>
                ))}
              </ul>
            )}
            <button
              type="button"
              onClick={() => setConfirmEnd(false)}
              className="mt-4 w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white"
            >
              Keep going
            </button>
            <button
              type="button"
              onClick={() => {
                const finished = endSession();
                setConfirmEnd(false);
                if (finished) {
                  summaryRef.current = finished;
                  setSummary(finished);
                }
              }}
              className="mt-2 w-full py-2 text-xs text-gray-500"
            >
              End now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
