"use client";

import { useMemo } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { PageHeader } from "@/components/layout/PageHeader";
import { InfoBanner } from "@/components/ui/InfoBanner";
import { TodaySessions } from "@/components/session/TodaySessions";
import { usePhaseStore } from "@/store";
import { formatDisplayDate } from "@/lib/dateUtils";
import { WaterGlance } from "@/components/water/WaterGlance";

export default function TodayPage() {
  const displayDate = useMemo(() => formatDisplayDate(), []);
  const currentPhase = usePhaseStore((s) => s.currentPhase);

  return (
    <PageWrapper>
      <PageHeader
        title="Today"
        subtitle={displayDate}
        phase={currentPhase}
      />

      <WaterGlance />

      <TodaySessions />

      <InfoBanner
        variant="warning"
        title="Bakody's Sign Notice"
        message="Lifting your arm onto your head relieves nerve root tension (C5/C6). If experiencing acute radicular pain, use this relief position."
      />
    </PageWrapper>
  );
}
