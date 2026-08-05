"use client";

import { useHistoryStore } from "@/store/useHistoryStore";

export function useStreak(): number {
  const { getStreak } = useHistoryStore();
  return getStreak();
}
