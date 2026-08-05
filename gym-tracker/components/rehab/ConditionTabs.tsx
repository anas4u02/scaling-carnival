"use client";

import type { RehabCondition } from "@/types";

interface ConditionTabsProps {
  selected: RehabCondition;
  onChange: (condition: RehabCondition) => void;
}

const TABS: { id: RehabCondition; label: string; icon: string }[] = [
  { id: "neck", label: "Neck", icon: "🦴" },
  { id: "shoulder", label: "Shoulders", icon: "💪" },
  { id: "lowerBack", label: "Lower Back", icon: "🧘" },
];

export function ConditionTabs({ selected, onChange }: ConditionTabsProps) {
  return (
    <div className="flex bg-gray-900 p-1.5 rounded-2xl border border-gray-800 mb-4 gap-1">
      {TABS.map((tab) => {
        const isSelected = selected === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
              isSelected
                ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
                : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
