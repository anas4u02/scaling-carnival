import { format } from "date-fns";

export function getTodayKey(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function formatDisplayDate(): string {
  return format(new Date(), "EEEE, d MMMM yyyy");
}
