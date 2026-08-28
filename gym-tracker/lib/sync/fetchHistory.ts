import { createClient } from "@/utils/supabase/client";

export type DayMetrics = {
  exerciseCounts: Record<string, number>;
  waterMl: Record<string, number>;
};

export async function fetchMetricsRange(
  fromKey: string,
  toKey: string
): Promise<DayMetrics | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [logsRes, sipsRes] = await Promise.all([
    supabase
      .from("exercise_logs")
      .select("log_date, completed")
      .gte("log_date", fromKey)
      .lte("log_date", toKey),
    supabase
      .from("water_sips")
      .select("log_date, ml")
      .gte("log_date", fromKey)
      .lte("log_date", toKey),
  ]);

  if (logsRes.error) throw new Error(logsRes.error.message);
  if (sipsRes.error) throw new Error(sipsRes.error.message);

  const exerciseCounts: Record<string, number> = {};
  for (const row of logsRes.data ?? []) {
    if (!row.completed) continue;
    const key = row.log_date as string;
    exerciseCounts[key] = (exerciseCounts[key] ?? 0) + 1;
  }

  const waterMl: Record<string, number> = {};
  for (const row of sipsRes.data ?? []) {
    const key = row.log_date as string;
    waterMl[key] = (waterMl[key] ?? 0) + (row.ml as number);
  }

  return { exerciseCounts, waterMl };
}
