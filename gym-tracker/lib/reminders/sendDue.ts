import webpush from "web-push";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { dailyExercises } from "@/data/exercises/daily";
import { APP_ORIGIN } from "@/lib/appOrigin";
import {
  MORNING_REMINDER_HOUR,
  WATER_GOAL_ML,
  dueWaterHour,
  waterReminderKey,
} from "@/lib/waterUtils";
import type { NotifyPayload } from "@/lib/notifications/payloads";
import {
  morningReminderPayload,
  streakReminderPayload,
  waterReminderPayload,
} from "@/lib/notifications/payloads";

const MORNING_IDS = dailyExercises
  .filter((ex) => ex.section === "morning")
  .map((ex) => ex.id);

type ProfileRow = {
  id: string;
  water_goal_ml: number | null;
  water_reminders: boolean | null;
  morning_reminder: boolean | null;
  streak_reminder: boolean | null;
  time_zone: string | null;
  last_water_push_key: string | null;
  last_morning_push_date: string | null;
  last_streak_push_date: string | null;
};

type SubRow = {
  endpoint: string;
  p256dh: string;
  auth: string;
  time_zone: string | null;
  user_id: string;
};

function appOrigin(): string {
  return APP_ORIGIN;
}

function absoluteUrl(path: string): string {
  const origin = appOrigin();
  if (!origin) return path;
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

function localNow(timeZone: string): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const pick = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return new Date(
    `${pick("year")}-${pick("month")}-${pick("day")}T${pick("hour")}:${pick("minute")}:00`
  );
}

function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function yesterdayKey(d: Date): string {
  const copy = new Date(d);
  copy.setDate(copy.getDate() - 1);
  return dateKey(copy);
}

function configureWebPush(): boolean {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:reminders@localhost";
  if (!publicKey || !privateKey) return false;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  return true;
}

function serviceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

async function sendPush(sub: SubRow, payload: NotifyPayload): Promise<boolean> {
  const body = JSON.stringify({
    title: payload.title,
    body: payload.body,
    tag: payload.tag,
    url: payload.url,
    web_push: 8030,
    notification: {
      title: payload.title,
      body: payload.body,
      navigate: absoluteUrl(payload.url),
    },
  });
  try {
    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      },
      body
    );
    return true;
  } catch (err) {
    const status = (err as { statusCode?: number }).statusCode;
    if (status === 404 || status === 410) return false;
    throw err;
  }
}

export async function sendDueReminders(): Promise<{ sent: number; gone: number }> {
  if (!configureWebPush()) {
    throw new Error("VAPID keys are not configured");
  }
  const supabase = serviceClient();
  const [{ data: profiles, error: profileError }, { data: subs, error: subError }] =
    await Promise.all([
      supabase.from("profiles").select(
        "id, water_goal_ml, water_reminders, morning_reminder, streak_reminder, time_zone, last_water_push_key, last_morning_push_date, last_streak_push_date"
      ),
      supabase.from("push_subscriptions").select("endpoint, p256dh, auth, time_zone, user_id"),
    ]);
  if (profileError) throw profileError;
  if (subError) throw subError;

  const profileById = new Map<string, ProfileRow>(
    ((profiles ?? []) as ProfileRow[]).map((row) => [row.id, row])
  );
  const subsByUser = new Map<string, SubRow[]>();
  for (const sub of (subs ?? []) as SubRow[]) {
    const list = subsByUser.get(sub.user_id) ?? [];
    list.push(sub);
    subsByUser.set(sub.user_id, list);
  }

  let sent = 0;
  let gone = 0;

  for (const [userId, userSubs] of subsByUser) {
    const profile = profileById.get(userId);
    if (!profile) continue;
    const timeZone = userSubs[0]?.time_zone || profile.time_zone || "UTC";
    const now = localNow(timeZone);
    const today = dateKey(now);
    const yesterday = yesterdayKey(now);
    const payloads: NotifyPayload[] = [];
    const patch: Partial<ProfileRow> = {};

    if (profile.water_reminders) {
      const hour = dueWaterHour(now);
      if (hour !== null) {
        const key = waterReminderKey(today, hour);
        if (profile.last_water_push_key !== key) {
          const { data: sips } = await supabase
            .from("water_sips")
            .select("ml")
            .eq("user_id", userId)
            .eq("log_date", today);
          const intake = (sips ?? []).reduce((sum, row) => sum + (row.ml ?? 0), 0);
          const goal = profile.water_goal_ml || WATER_GOAL_ML;
          if (intake < goal) {
            payloads.push(waterReminderPayload(intake, goal));
            patch.last_water_push_key = key;
          } else {
            patch.last_water_push_key = key;
          }
        }
      }
    }

    if (profile.morning_reminder && now.getHours() >= MORNING_REMINDER_HOUR) {
      if (profile.last_morning_push_date !== today) {
        const { data: logs } = await supabase
          .from("exercise_logs")
          .select("exercise_id, completed")
          .eq("user_id", userId)
          .eq("log_date", today)
          .in("exercise_id", MORNING_IDS);
        const done = new Set(
          (logs ?? [])
            .filter((row) => row.completed)
            .map((row) => row.exercise_id as string)
        );
        const morningLeft = MORNING_IDS.some((id) => !done.has(id));
        if (morningLeft) payloads.push(morningReminderPayload());
        patch.last_morning_push_date = today;
      }
    }

    if (profile.streak_reminder && now.getHours() >= MORNING_REMINDER_HOUR) {
      if (profile.last_streak_push_date !== today) {
        const { data: yesterdayLogs } = await supabase
          .from("exercise_logs")
          .select("completed")
          .eq("user_id", userId)
          .eq("log_date", yesterday);
        const yesterdayCount = (yesterdayLogs ?? []).filter((row) => row.completed).length;
        if (yesterdayCount === 0) {
          const { count } = await supabase
            .from("exercise_logs")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId)
            .lt("log_date", today)
            .eq("completed", true);
          if ((count ?? 0) > 0) payloads.push(streakReminderPayload());
        }
        patch.last_streak_push_date = today;
      }
    }

    if (payloads.length === 0 && Object.keys(patch).length === 0) continue;

    const live: SubRow[] = [];
    for (const sub of userSubs) {
      let keep = true;
      for (const payload of payloads) {
        const ok = await sendPush(sub, payload);
        if (!ok) {
          keep = false;
          gone += 1;
          break;
        }
        sent += 1;
      }
      if (keep) live.push(sub);
    }

    const stale = userSubs
      .filter((sub) => !live.some((row) => row.endpoint === sub.endpoint))
      .map((sub) => sub.endpoint);
    if (stale.length > 0) {
      await supabase.from("push_subscriptions").delete().in("endpoint", stale);
    }
    if (Object.keys(patch).length > 0) {
      await supabase.from("profiles").update(patch).eq("id", userId);
    }
  }

  return { sent, gone };
}
