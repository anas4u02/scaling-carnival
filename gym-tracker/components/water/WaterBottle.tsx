"use client";

import type { WaterBottleProps } from "@/types";
import { formatMlAsLiters, glassesFor, waterFillPct } from "@/lib/waterUtils";

export function WaterBottle({ intakeMl, goalMl }: WaterBottleProps) {
  const pct = waterFillPct(intakeMl, goalMl);
  const overflow = intakeMl > goalMl;
  const glasses = glassesFor(Math.min(intakeMl, goalMl));
  const goalGlasses = glassesFor(goalMl);
  const waterHeight = (pct / 100) * 168;
  const waterTop = 236 - waterHeight;

  return (
    <div className="relative mx-auto w-44">
      <svg
        viewBox="0 0 160 280"
        className="w-full h-auto drop-shadow-[0_12px_24px_rgba(14,165,233,0.18)]"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="waterFill" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#0369a1" />
            <stop offset="55%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#67e8f9" />
          </linearGradient>
          <linearGradient id="glassSheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="white" stopOpacity="0.16" />
            <stop offset="45%" stopColor="white" stopOpacity="0" />
            <stop offset="100%" stopColor="white" stopOpacity="0.08" />
          </linearGradient>
          <clipPath id="bottleInner">
            <path d="M48 68 C48 62 52 58 58 58 H102 C108 58 112 62 112 68 V78 C124 86 130 102 130 124 V228 C130 242 118 252 104 252 H56 C42 252 30 242 30 228 V124 C30 102 36 86 48 78 Z" />
          </clipPath>
        </defs>

        {/* Cap */}
        <rect x="58" y="18" width="44" height="14" rx="4" fill="#155e75" />
        <rect x="64" y="8" width="32" height="12" rx="6" fill="#22d3ee" />

        {/* Neck */}
        <path
          d="M66 32 H94 L100 58 H60 Z"
          fill="#1e293b"
          stroke="#334155"
          strokeWidth="2"
        />

        {/* Bottle glass */}
        <path
          d="M44 64 C44 56 52 50 62 50 H98 C108 50 116 56 116 64 V78 C130 88 138 106 138 126 V230 C138 248 122 262 104 262 H56 C38 262 22 248 22 230 V126 C22 106 30 88 44 78 Z"
          fill="#0f172a"
          stroke="#334155"
          strokeWidth="3"
        />

        {/* Water */}
        <g clipPath="url(#bottleInner)">
          <rect
            x="20"
            y={waterTop}
            width="120"
            height={waterHeight + 20}
            fill="url(#waterFill)"
            className="transition-all duration-500 ease-out"
          />
          {pct > 0 && pct < 100 && (
            <g style={{ transform: `translateY(${waterTop - 8}px)` }}>
              <path
                className="water-wave"
                d="M0 12 Q20 0 40 12 T80 12 T120 12 T160 12 V24 H0 Z"
                fill="#7dd3fc"
                opacity="0.55"
              />
            </g>
          )}
        </g>

        {/* Sheen */}
        <path
          d="M40 80 C40 80 48 200 48 230 C36 220 34 140 40 80 Z"
          fill="url(#glassSheen)"
        />

        {/* 250 ml ticks */}
        {Array.from({ length: goalGlasses }, (_, i) => {
          const markPct = ((i + 1) / goalGlasses) * 100;
          const y = 236 - (markPct / 100) * 168;
          const isLiter = (i + 1) % 4 === 0;
          return (
            <g key={i}>
              <line
                x1="116"
                x2={isLiter ? 130 : 124}
                y1={y}
                y2={y}
                stroke={isLiter ? "#67e8f9" : "#475569"}
                strokeWidth={isLiter ? 2 : 1}
              />
            </g>
          );
        })}
      </svg>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-10">
        <div
          className={`text-3xl font-bold tabular-nums ${
            overflow ? "text-emerald-300" : "text-white"
          }`}
        >
          {formatMlAsLiters(intakeMl)}
        </div>
        <div className="text-[11px] text-cyan-200/80 mt-0.5">
          {glasses}/{goalGlasses} · {pct}%
        </div>
        {overflow && (
          <div className="text-[10px] font-semibold text-emerald-400 mt-1 uppercase tracking-wider">
            Goal crushed
          </div>
        )}
      </div>
    </div>
  );
}
