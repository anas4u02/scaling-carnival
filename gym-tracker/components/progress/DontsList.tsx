"use client";

import { useState } from "react";
import { donts } from "@/data";
import type { DontSeverity } from "@/types";
import { AlertOctagon, ShieldAlert, AlertTriangle } from "lucide-react";

const SEVERITY_CONFIG: Record<
  DontSeverity,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  permanent: {
    label: "Permanent Rules",
    icon: AlertOctagon,
    color: "text-red-400 border-red-500/30 bg-red-950/20",
  },
  phaseBased: {
    label: "Phase Limits",
    icon: ShieldAlert,
    color: "text-amber-400 border-amber-500/30 bg-amber-950/20",
  },
  positions: {
    label: "Positions to Avoid",
    icon: AlertTriangle,
    color: "text-yellow-400 border-yellow-500/30 bg-yellow-950/20",
  },
};

export function DontsList() {
  const [activeTab, setActiveTab] = useState<DontSeverity>("permanent");

  const filteredDonts = donts.filter((item) => item.severity === activeTab);
  const currentConfig = SEVERITY_CONFIG[activeTab];
  const Icon = currentConfig.icon;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-4">
      <h3 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-3">
        Safety Rules & Don'ts
      </h3>

      {/* Tabs */}
      <div className="flex bg-gray-950 p-1 rounded-xl border border-gray-800/60 mb-4">
        {(Object.keys(SEVERITY_CONFIG) as DontSeverity[]).map((severity) => (
          <button
            key={severity}
            onClick={() => setActiveTab(severity)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === severity
                ? "bg-gray-800 text-white shadow-sm"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {severity === "permanent"
              ? "Permanent"
              : severity === "phaseBased"
              ? "Phase Limits"
              : "Positions"}
          </button>
        ))}
      </div>

      {/* Items list */}
      <div className="space-y-3">
        {filteredDonts.map((item) => (
          <div
            key={item.id}
            className={`p-3.5 rounded-xl border ${currentConfig.color} flex items-start gap-3`}
          >
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-white">{item.name}</h4>
              <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">{item.reason}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
