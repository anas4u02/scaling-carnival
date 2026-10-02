"use client";

import { format, subDays } from "date-fns";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { buildSessionDeck } from "@/lib/sessions/buildDeck";
import { getTodayKey } from "@/lib/dateUtils";
import type {
  ActiveSession,
  SessionCard,
  SessionExerciseResult,
  SessionMode,
  SessionRecord,
} from "@/types";
import { useExerciseStore } from "./useExerciseStore";
import { usePhaseStore } from "./usePhaseStore";

const DEBT_STEP = 2;
const DEBT_CAP = 8;
const HISTORY_DAYS = 120;

interface SessionStore {
  sessions: SessionRecord[];
  debts: Record<string, number>;
  active: ActiveSession | null;
  startSession: (mode: SessionMode) => boolean;
  increment: () => void;
  advance: () => SessionRecord | null;
  skip: () => SessionRecord | null;
  endSession: () => SessionRecord | null;
}

function resultFromCard(card: SessionCard): SessionExerciseResult {
  return {
    movementId: card.movementId,
    exerciseId: card.exerciseId,
    family: card.family,
    name: card.name,
    dose: card.dose,
    target: card.target,
    unit: card.unit,
    done: 0,
    skipped: false,
    completed: false,
  };
}

function trimSessions(sessions: SessionRecord[]): SessionRecord[] {
  const cutoff = format(subDays(new Date(), HISTORY_DAYS), "yyyy-MM-dd");
  return sessions.filter((session) => session.date >= cutoff);
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      debts: {},
      active: null,

      startSession: (mode) => {
        if (get().active) return false;
        const date = getTodayKey();
        const phase = usePhaseStore.getState().currentPhase;
        const { sessions, debts } = get();
        const cards = buildSessionDeck({ mode, phase, date, sessions, debts });
        if (cards.length === 0) return false;
        const active: ActiveSession = {
          id: crypto.randomUUID(),
          date,
          mode,
          phase,
          startedAt: new Date().toISOString(),
          cards,
          index: 0,
          results: cards.map(resultFromCard),
        };
        set({ active });
        return true;
      },

      increment: () => {
        const active = get().active;
        if (!active) return;
        const current = active.results[active.index];
        if (!current || current.completed || current.skipped) return;
        const done = current.done + 1;
        const completed = done >= current.target;
        const results = active.results.map((result, index) =>
          index === active.index ? { ...result, done, completed } : result
        );
        const debts = { ...get().debts };
        if (completed) {
          debts[current.family] = 0;
          useExerciseStore.getState().complete(current.exerciseId, active.date);
        }
        set({ active: { ...active, results }, debts });
      },

      advance: () => {
        const active = get().active;
        if (!active) return null;
        const current = active.results[active.index];
        if (!current?.completed) return null;
        const next = active.index + 1;
        if (next >= active.cards.length) return finish(set, get);
        set({ active: { ...active, index: next } });
        return null;
      },

      skip: () => {
        const active = get().active;
        if (!active) return null;
        const current = active.results[active.index];
        if (!current || current.completed || current.skipped) return null;
        const results = active.results.map((result, index) =>
          index === active.index ? { ...result, skipped: true } : result
        );
        const debts = {
          ...get().debts,
          [current.family]: Math.min(DEBT_CAP, (get().debts[current.family] ?? 0) + DEBT_STEP),
        };
        const next = active.index + 1;
        if (next >= active.cards.length) {
          set({ debts, active: { ...active, results } });
          return finish(set, get);
        }
        set({ debts, active: { ...active, results, index: next } });
        return null;
      },

      endSession: () => finish(set, get),
    }),
    {
      name: "gym-tracker-sessions",
      partialize: (state) => ({
        sessions: state.sessions,
        debts: state.debts,
        active: state.active,
      }),
    }
  )
);

function finish(
  set: (partial: Partial<SessionStore>) => void,
  get: () => SessionStore
): SessionRecord | null {
  const active = get().active;
  if (!active) return null;
  const status = active.results.every((result) => result.completed) ? "completed" : "partial";
  const record: SessionRecord = {
    id: active.id,
    date: active.date,
    mode: active.mode,
    phase: active.phase,
    startedAt: active.startedAt,
    endedAt: new Date().toISOString(),
    status,
    exercises: active.results,
  };
  set({
    sessions: trimSessions([...get().sessions, record]),
    active: null,
  });
  return record;
}
