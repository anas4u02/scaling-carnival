import React from "react";
import { Badge } from "@/components/ui/Badge";
import { SearchHeaderButton } from "@/components/search/SearchHeaderButton";
import type { PhaseNumber } from "@/types";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  phase?: PhaseNumber;
  action?: React.ReactNode;
  showSearch?: boolean;
}

export function PageHeader({
  title,
  subtitle,
  phase,
  action,
  showSearch = true,
}: PageHeaderProps) {
  return (
    <header className="flex items-start justify-between mb-4">
      <div className="min-w-0 pr-3">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
          {phase !== undefined && <Badge phase={phase} variant="solid" />}
        </div>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {(showSearch || action) && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {showSearch && <SearchHeaderButton />}
          {action}
        </div>
      )}
    </header>
  );
}
