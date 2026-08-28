"use client";

import type { WaterWeeklyChartProps } from "@/types";
import { compactLiters, formatMlAsLiters, isWaterGoalMet } from "@/lib/waterUtils";

export function WaterWeeklyChart({ days, goalMl, todayKey }: WaterWeeklyChartProps) {
  const peakMl = Math.max(goalMl, ...days.map((d) => d.ml), 1);
  const goalHeightPct = Math.round((goalMl / peakMl) * 100);
  const elapsed = days.filter((d) => !d.isFuture && d.date <= todayKey);
  const daysHit = elapsed.filter((d) => isWaterGoalMet(d.ml, goalMl)).length;

  return (
    <div>
      <div className="flex justify-end mb-2">
        <span className="text-[11px] text-cyan-200/70 tabular-nums">
          {daysHit}/{Math.max(elapsed.length, 1)} hit {formatMlAsLiters(goalMl)}
        </span>
      </div>

      <div className="flex justify-between px-2 mb-1">
        {days.map((d) => (
          <div key={`${d.date}-val`} className="flex-1 text-center">
            <span className="text-[10px] text-gray-400 tabular-nums">
              {compactLiters(d.ml)}
            </span>
          </div>
        ))}
      </div>

      <div className="relative h-24 mx-2">
        <div
          className="absolute left-0 right-0 z-10 border-t border-dashed border-cyan-600/60 pointer-events-none"
          style={{ bottom: `${goalHeightPct}%` }}
          aria-hidden
        />
        <div className="absolute inset-0 flex items-end justify-between gap-1">
          {days.map((d) => {
            const heightPercent = Math.min(Math.round((d.ml / peakMl) * 100), 100);
            const isToday = d.date === todayKey;
            const hitGoal = isWaterGoalMet(d.ml, goalMl);

            return (
              <div
                key={`${d.date}-bar`}
                className={`flex-1 h-full max-w-[28px] mx-auto bg-gray-800 rounded-t-md overflow-hidden flex items-end ${
                  d.isFuture ? "opacity-35" : ""
                }`}
              >
                <div
                  className={`w-full transition-all duration-500 rounded-t-md ${
                    hitGoal
                      ? "bg-emerald-500"
                      : isToday
                        ? "bg-sky-400"
                        : "bg-sky-700"
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between px-2 mt-2">
        {days.map((d) => (
          <div key={`${d.date}-lbl`} className="flex-1 text-center">
            <span
              className={`text-xs font-medium ${
                d.date === todayKey ? "text-white" : "text-gray-400"
              }`}
            >
              {d.label}
            </span>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-gray-600 mt-3 text-center">
        Dashed line is the {formatMlAsLiters(goalMl)} daily goal · values in litres
      </p>
    </div>
  );
}
