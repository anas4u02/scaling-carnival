"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { Dumbbell, Moon, Sun } from "lucide-react";
import { buildSessionDeck } from "@/lib/sessions/buildDeck";
import { SESSION_MODE_LABEL, formatSessionMinutes } from "@/lib/sessions/labels";
import { getTodayKey } from "@/lib/dateUtils";
import { usePhaseStore, useSessionStore } from "@/store";
import type { SessionMode, SessionRecord } from "@/types";

const MODES: { mode: SessionMode; icon: typeof Sun; hint: string }[] = [
  { mode: "morning", icon: Sun, hint: "Crucial work, plus a few extras" },
  { mode: "evening", icon: Moon, hint: "Second pass of the crucial work" },
  { mode: "gym", icon: Dumbbell, hint: "Strength session for this phase" },
];

export function TodaySessions() {
  const router = useRouter();
  const todayKey = useMemo(() => getTodayKey(), []);
  const phase = usePhaseStore((s) => s.currentPhase);
  const sessions = useSessionStore((s) => s.sessions);
  const debts = useSessionStore((s) => s.debts);
  const active = useSessionStore((s) => s.active);
  const startSession = useSessionStore((s) => s.startSession);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (useSessionStore.persist.hasHydrated()) setHydrated(true);
    return useSessionStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);

  const trainedToday = sessions.some((session) => session.date === todayKey && session.mode === "gym");
  const todaySessions = sessions
    .filter((session) => session.date === todayKey)
    .sort((a, b) => a.startedAt.localeCompare(b.startedAt));
  const earlier = groupEarlier(sessions.filter((session) => session.date < todayKey));

  const previews = useMemo(() => {
    return MODES.map(({ mode }) =>
      buildSessionDeck({ mode, phase, date: todayKey, sessions, debts })
    );
  }, [phase, todayKey, sessions, debts]);

  const activeToday = active?.date === todayKey ? active : null;

  const open = (mode: SessionMode) => {
    if (activeToday?.mode === mode) {
      router.push("/session");
      return;
    }
    if (activeToday) return;
    if (todaySessions.some((session) => session.mode === mode)) return;
    const started = startSession(mode);
    if (started) router.push("/session");
  };

  return (
    <section className="mb-6 space-y-3">
      {MODES.map(({ mode, icon: Icon, hint }, index) => {
        const saved = todaySessions.find((session) => session.mode === mode);
        const isActive = activeToday?.mode === mode;
        const blocked = Boolean(activeToday && !isActive);
        const done = Boolean(saved);
        const count = previews[index]?.length ?? 0;
        return (
          <button
            key={mode}
            type="button"
            disabled={!hydrated || blocked || (done && !isActive)}
            onClick={() => open(mode)}
            className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
              done && !isActive
                ? "border-emerald-900/50 bg-emerald-950/20"
                : blocked
                  ? "border-gray-800 bg-gray-900/30 opacity-50"
                  : "border-gray-700 bg-gray-900/60 active:bg-gray-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-blue-300">
                <Icon size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-white">{SESSION_MODE_LABEL[mode]}</p>
                  <span className="text-[11px] text-gray-400">
                    {isActive ? "Resume" : done ? (saved?.status === "partial" ? "Ended early" : "Done") : `${count} exercises`}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {isActive
                    ? "Pick up the card you were on"
                    : done
                      ? "Saved for today"
                      : mode === "evening" && trainedToday
                        ? "Rehab the gym session did not cover"
                        : hint}
                </p>
              </div>
            </div>
          </button>
        );
      })}

      {todaySessions.length > 0 && (
        <div className="space-y-2 pt-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Today</h2>
          {todaySessions.map((session) => (
            <SessionLogCard key={session.id} session={session} />
          ))}
        </div>
      )}

      {earlier.length > 0 && (
        <div className="space-y-3 pt-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Earlier</h2>
          {earlier.map(([date, daySessions]) => (
            <div key={date} className="space-y-2">
              <p className="text-[11px] text-gray-500">{format(parseISO(`${date}T12:00:00`), "EEE d MMM")}</p>
              {daySessions.map((session) => (
                <SessionLogCard key={session.id} session={session} />
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function SessionLogCard({ session }: { session: SessionRecord }) {
  const done = session.exercises.filter((exercise) => exercise.completed);
  const skipped = session.exercises.filter((exercise) => exercise.skipped);
  const missed = session.exercises.filter((exercise) => !exercise.completed && !exercise.skipped);
  return (
    <article className="rounded-xl border border-gray-800 bg-gray-900/40 px-3 py-3">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-medium text-white">
          {SESSION_MODE_LABEL[session.mode]}
          <span className="ml-2 text-[11px] font-normal text-gray-500">
            {format(parseISO(session.startedAt), "h:mm a")}
          </span>
        </p>
        <p className="text-[11px] text-gray-400">
          {formatSessionMinutes(session.startedAt, session.endedAt)}
          {session.status === "partial" ? " · partial" : ""}
        </p>
      </div>
      {done.length > 0 && (
        <p className="mt-1.5 text-xs leading-relaxed text-gray-300">{done.map((exercise) => exercise.name).join(" · ")}</p>
      )}
      {skipped.length > 0 && (
        <p className="mt-1 text-xs text-amber-200/80">Skipped: {skipped.map((exercise) => exercise.name).join(", ")}</p>
      )}
      {missed.length > 0 && (
        <p className="mt-1 text-xs text-gray-500">Not reached: {missed.map((exercise) => exercise.name).join(", ")}</p>
      )}
    </article>
  );
}

function groupEarlier(sessions: SessionRecord[]): [string, SessionRecord[]][] {
  const byDate = new Map<string, SessionRecord[]>();
  const sorted = [...sessions].sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  for (const session of sorted) {
    const day = byDate.get(session.date) ?? [];
    day.push(session);
    byDate.set(session.date, day);
  }
  return [...byDate.entries()].slice(0, 7);
}
