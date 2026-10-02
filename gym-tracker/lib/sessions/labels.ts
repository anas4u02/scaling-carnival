import type { SessionMode, SessionUnit } from "@/types";

export const SESSION_MODE_LABEL: Record<SessionMode, string> = {
  morning: "Morning",
  evening: "Evening",
  gym: "Gym",
};

export function unitWord(unit: SessionUnit, count: number): string {
  if (unit === "set") return count === 1 ? "set" : "sets";
  if (unit === "side") return count === 1 ? "side" : "sides";
  if (unit === "hold") return count === 1 ? "hold" : "holds";
  return count === 1 ? "rep" : "reps";
}

export function formatSessionMinutes(startedAt: string, endedAt: string): string {
  const ms = new Date(endedAt).getTime() - new Date(startedAt).getTime();
  const minutes = Math.max(1, Math.round(ms / 60000));
  return `${minutes} min`;
}
