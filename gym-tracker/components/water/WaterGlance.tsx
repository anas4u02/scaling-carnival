"use client";

import Link from "next/link";
import { Droplets } from "lucide-react";
import { useWaterStore } from "@/store/useWaterStore";
import { getTodayKey } from "@/lib/dateUtils";
import { formatMlAsLiters, isWaterGoalMet, waterFillPct } from "@/lib/waterUtils";

export function WaterGlance() {
  const todayKey = getTodayKey();
  const goalMl = useWaterStore((s) => s.goalMl);
  const logs = useWaterStore((s) => s.logs);
  const intakeMl = (logs[todayKey] ?? []).reduce((sum, entry) => sum + entry.ml, 0);
  const pct = waterFillPct(intakeMl, goalMl);
  const done = isWaterGoalMet(intakeMl, goalMl);

  return (
    <Link
      href="/water"
      className="mb-6 flex items-center gap-3 rounded-xl border border-cyan-900/40 bg-sky-950/30 px-3 py-2.5"
    >
      <Droplets size={16} className={done ? "text-emerald-400" : "text-sky-400"} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-xs font-medium text-white">Water</span>
          <span className="text-[11px] text-cyan-200/80 tabular-nums">
            {formatMlAsLiters(intakeMl)} / {formatMlAsLiters(goalMl)}
          </span>
        </div>
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              done ? "bg-emerald-400" : "bg-sky-400"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </Link>
  );
}
