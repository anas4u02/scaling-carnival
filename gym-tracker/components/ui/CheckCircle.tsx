"use client";

import { Check } from "lucide-react";

interface CheckCircleProps {
  checked: boolean;
  onToggle: () => void;
}

export function CheckCircle({ checked, onToggle }: CheckCircleProps) {
  return (
    <button
      onClick={onToggle}
      className="flex-shrink-0 w-7 h-7 flex items-center justify-center"
      aria-label={checked ? "Mark as incomplete" : "Mark as complete"}
    >
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
          checked
            ? "bg-emerald-500 border-emerald-500"
            : "border-gray-500 hover:border-gray-300"
        }`}
      >
        {checked && <Check size={10} className="text-white" strokeWidth={3} />}
      </div>
    </button>
  );
}
