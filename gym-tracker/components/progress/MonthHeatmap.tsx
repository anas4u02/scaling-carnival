"use client";

import { DAY_LABELS, type HeatmapWeek } from "@/lib/periodUtils";

type HeatmapTone = "activity" | "water";

function intensityClass(
  value: number,
  isFuture: boolean,
  inMonth: boolean,
  tone: HeatmapTone,
  goal?: number
): string {
  if (isFuture) return "bg-transparent";
  if (!inMonth) return "bg-gray-900";
  if (tone === "water") {
    const goalMl = goal ?? 3000;
    if (value <= 0) return "bg-gray-800";
    const pct = value / goalMl;
    if (pct < 0.34) return "bg-sky-900";
    if (pct < 0.67) return "bg-sky-700";
    if (pct < 1) return "bg-sky-500";
    return "bg-emerald-500";
  }
  if (value <= 0) return "bg-gray-800";
  if (value <= 2) return "bg-emerald-900";
  if (value <= 5) return "bg-emerald-700";
  if (value <= 9) return "bg-emerald-500";
  return "bg-emerald-400";
}

interface MonthHeatmapProps {
  weeks: HeatmapWeek[];
  values: Record<string, number>;
  onSelectDate: (date: string) => void;
  tone?: HeatmapTone;
  goalMl?: number;
  unitLabel?: string;
}

export function MonthHeatmap({
  weeks,
  values = {},
  onSelectDate,
  tone = "activity",
  goalMl,
  unitLabel = "exercises",
}: MonthHeatmapProps) {
  const legend =
    tone === "water"
      ? ["bg-gray-800", "bg-sky-900", "bg-sky-700", "bg-sky-500", "bg-emerald-500"]
      : ["bg-gray-800", "bg-emerald-900", "bg-emerald-700", "bg-emerald-500", "bg-emerald-400"];

  return (
    <div>
      <div className="flex justify-center gap-1.5">
        <div className="flex flex-col gap-1">
          {DAY_LABELS.map((label, index) => (
            <span
              key={`${label}-${index}`}
              className="h-3.5 w-3 text-[9px] leading-[14px] text-gray-500"
            >
              {index % 2 === 0 ? label : ""}
            </span>
          ))}
        </div>
        <div className="flex gap-1">
          {weeks.map((week, wi) => (
            <div key={week[0]?.date ?? wi} className="flex flex-col gap-1">
              {week.map((cell) => {
                const value = values[cell.date] ?? 0;
                return (
                  <button
                    key={cell.date}
                    type="button"
                    disabled={cell.isFuture || !cell.inMonth}
                    title={
                      cell.isFuture || !cell.inMonth
                        ? undefined
                        : `${cell.date}: ${value} ${unitLabel}`
                    }
                    onClick={() => onSelectDate(cell.date)}
                    className={`h-3.5 w-3.5 rounded-[3px] ${intensityClass(
                      value,
                      cell.isFuture,
                      cell.inMonth,
                      tone,
                      goalMl
                    )} ${cell.isToday ? "ring-1 ring-white/80" : ""} ${
                      cell.isFuture || !cell.inMonth
                        ? "cursor-default"
                        : "hover:ring-1 hover:ring-white/40"
                    }`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-end gap-1 mt-3">
        <span className="text-[10px] text-gray-600 mr-1">Less</span>
        {legend.map((cls) => (
          <span key={cls} className={`h-2.5 w-2.5 rounded-[2px] ${cls}`} />
        ))}
        <span className="text-[10px] text-gray-600 ml-1">More</span>
      </div>
      <p className="text-[10px] text-gray-600 mt-2 text-center">
        Tap a day to open that week
      </p>
    </div>
  );
}
