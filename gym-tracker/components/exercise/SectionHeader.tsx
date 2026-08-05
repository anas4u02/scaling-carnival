"use client";

import type { SectionHeaderProps } from "@/types";

export function SectionHeader({ label, done, total }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-2 mt-5 first:mt-0">
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
        {label}
      </div>
      <div className="text-xs text-gray-500">
        {done}/{total}
      </div>
    </div>
  );
}
