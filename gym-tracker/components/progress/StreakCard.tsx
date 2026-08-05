"use client";

import { Flame, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { PhaseNumber } from "@/types";

interface StreakCardProps {
  streak: number;
  todayCount: number;
  phase: PhaseNumber;
}

export function StreakCard({ streak, todayCount, phase }: StreakCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">
          Current Activity
        </span>
        <Badge phase={phase} variant="solid" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3 bg-gray-950/60 p-3 rounded-xl border border-gray-800/50">
          <div className="p-2.5 rounded-lg bg-orange-500/10 text-orange-500">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{streak}</div>
            <div className="text-xs text-gray-400">Day Streak</div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-gray-950/60 p-3 rounded-xl border border-gray-800/50">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{todayCount}</div>
            <div className="text-xs text-gray-400">Today Done</div>
          </div>
        </div>
      </div>
    </div>
  );
}
