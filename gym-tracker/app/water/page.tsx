"use client";

import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { Droplets, RotateCcw } from "lucide-react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { PageHeader } from "@/components/layout/PageHeader";
import { WaterBottle } from "@/components/water/WaterBottle";
import { useWaterStore } from "@/store/useWaterStore";
import { getTodayKey } from "@/lib/dateUtils";
import {
  USER_AGE_YEARS,
  WATER_SIP_ML,
  formatMlAsLiters,
  glassesFor,
  isWaterGoalMet,
  remainingMl,
} from "@/lib/waterUtils";

export default function WaterPage() {
  const [todayKey, setTodayKey] = useState(getTodayKey);

  useEffect(() => {
    const sync = () => setTodayKey(getTodayKey());
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  const goalMl = useWaterStore((s) => s.goalMl);
  const logs = useWaterStore((s) => s.logs);
  const addSip = useWaterStore((s) => s.addSip);
  const undoLast = useWaterStore((s) => s.undoLast);

  const entries = logs[todayKey] ?? [];
  const intakeMl = useMemo(
    () => entries.reduce((sum, entry) => sum + entry.ml, 0),
    [entries]
  );
  const goalMet = isWaterGoalMet(intakeMl, goalMl);
  const leftMl = remainingMl(intakeMl, goalMl);

  return (
    <PageWrapper>
      <PageHeader
        title="Water"
        subtitle={`${USER_AGE_YEARS} yr · ${formatMlAsLiters(goalMl)} from drinks today`}
      />

      <div className="rounded-2xl border border-cyan-900/40 bg-gradient-to-b from-sky-950/50 to-gray-950 p-4 mb-4">
        <WaterBottle intakeMl={intakeMl} goalMl={goalMl} />

        <p className="text-center text-xs text-gray-400 mt-3 leading-relaxed">
          {goalMet
            ? "Daily target hit. Extra sips still count."
            : `${glassesFor(leftMl)} × ${WATER_SIP_ML} ml left · discs like a hydrated day.`}
        </p>

        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={() => addSip(todayKey, WATER_SIP_ML)}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-semibold py-3.5 text-sm transition-colors"
          >
            <Droplets size={16} />
            + {WATER_SIP_ML} ml
          </button>
          <button
            type="button"
            onClick={() => undoLast(todayKey)}
            disabled={entries.length === 0}
            className="flex items-center justify-center rounded-xl border border-gray-700 bg-gray-900 text-gray-300 disabled:opacity-30 w-14 transition-colors"
            aria-label="Undo last sip"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      <section className="mb-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
          Today’s glasses
        </h2>
        {entries.length === 0 ? (
          <p className="text-xs text-gray-500 rounded-xl border border-gray-800 bg-gray-900/40 px-3 py-3">
            No sips yet. First glass is due from 9:00 AM.
          </p>
        ) : (
          <ul className="rounded-xl border border-gray-800 divide-y divide-gray-800/80 overflow-hidden">
            {[...entries].reverse().map((entry, index) => (
              <li
                key={entry.id}
                className="flex items-center justify-between px-3 py-2 bg-gray-900/40"
              >
                <span className="text-xs text-gray-400">
                  {format(parseISO(entry.at), "h:mm a")}
                </span>
                <span className="text-xs text-cyan-300 tabular-nums">
                  +{entry.ml} ml
                  {index === 0 ? (
                    <span className="text-gray-600"> · latest</span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageWrapper>
  );
}
