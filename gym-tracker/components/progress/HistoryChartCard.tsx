"use client";

import { Calendar } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { PeriodNav } from "@/components/progress/PeriodNav";
import type { HistoryView } from "@/hooks/useHistoryPeriod";

interface HistoryChartCardProps {
  title: string;
  hint?: ReactNode;
  view: HistoryView;
  weekLabel: string;
  monthLabel: string;
  weekOffset: number;
  monthOffset: number;
  showSignInHint: boolean;
  loginNext: string;
  error: string | null;
  signedIn: boolean;
  loading: boolean;
  onToggleView: () => void;
  onWeekPrev: () => void;
  onWeekNext: () => void;
  onMonthPrev: () => void;
  onMonthNext: () => void;
  children: ReactNode;
}

export function HistoryChartCard({
  title,
  hint,
  view,
  weekLabel,
  monthLabel,
  weekOffset,
  monthOffset,
  showSignInHint,
  loginNext,
  error,
  signedIn,
  loading,
  onToggleView,
  onWeekPrev,
  onWeekNext,
  onMonthPrev,
  onMonthNext,
  children,
}: HistoryChartCardProps) {
  const isMonth = view === "month";

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="text-xs uppercase tracking-wider font-semibold text-gray-400">
          {title}
        </h3>
        {hint}
      </div>

      <PeriodNav
        label={isMonth ? monthLabel : weekLabel}
        onPrev={
          isMonth ? onMonthPrev : onWeekPrev
        }
        onNext={isMonth ? onMonthNext : onWeekNext}
        canNext={isMonth ? monthOffset > 0 : weekOffset > 0}
        prevLabel={isMonth ? "Previous month" : "Previous week"}
        nextLabel={isMonth ? "Next month" : "Next week"}
        trailing={
          <button
            type="button"
            onClick={onToggleView}
            aria-label={isMonth ? "Show weekly chart" : "Show monthly calendar"}
            aria-pressed={isMonth}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
              isMonth
                ? "border-sky-500/60 bg-sky-500/15 text-sky-300"
                : "border-gray-800 text-gray-300"
            }`}
          >
            <Calendar size={15} />
          </button>
        }
      />

      {showSignInHint && (
        <p className="text-[11px] text-amber-300/90 mt-2 leading-relaxed">
          Sign in to load earlier {isMonth ? "months" : "weeks"} from the cloud.{" "}
          <Link href={loginNext} className="underline">
            Sign in
          </Link>
        </p>
      )}
      {error && signedIn && (
        <p className="text-[11px] text-amber-300/80 mt-2">{error}</p>
      )}
      {loading && (weekOffset > 0 || isMonth) && (
        <p className="text-[11px] text-gray-500 mt-2">Loading…</p>
      )}

      <div className="mt-3">{children}</div>
    </div>
  );
}
