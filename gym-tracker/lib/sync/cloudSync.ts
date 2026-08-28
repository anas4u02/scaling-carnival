"use client";

import { WATER_GOAL_ML } from "@/lib/waterUtils";
import { ensureSipId } from "@/lib/sync/ids";
import { getCloudOwnerId, setCloudOwnerId } from "@/lib/sync/owner";
import { localPersistRange, pickKeyRange } from "@/lib/periodUtils";
import {
  useExerciseStore,
  usePhaseStore,
  useSettingsStore,
  useWaterStore,
} from "@/store";
import { useHistoryCacheStore } from "@/store/useHistoryCacheStore";
import { useProfileStore } from "@/store/useProfileStore";
import { useSyncStore } from "@/store/useSyncStore";
import type {
  CompletionMap,
  Gender,
  PhaseNumber,
  WaterEntry,
} from "@/types";
import type { SupabaseClient } from "@supabase/supabase-js";

const DEBOUNCE_MS = 700;
const UPSERT_CHUNK = 200;

type ProfileRow = {
  current_phase: number;
  water_goal_ml: number;
  water_reminders: boolean;
  morning_reminder: boolean;
  streak_reminder: boolean;
  display_name?: string | null;
  age_years?: number | null;
  gender?: string | null;
};

type ExerciseLogRow = {
  log_date: string;
  exercise_id: string;
  completed: boolean;
};

type WaterSipRow = {
  id: string;
  log_date: string;
  ml: number;
  taken_at: string;
};

type Snapshot = {
  logs: Record<string, CompletionMap>;
  water: Record<string, WaterEntry[]>;
  phase: PhaseNumber;
  goalMl: number;
  waterReminders: boolean;
  morningReminder: boolean;
  streakReminder: boolean;
  displayName: string;
  ageYears: number | null;
  gender: Gender | null;
};

let applyingRemote = false;
let writeUserId: string | null = null;
let writeClient: SupabaseClient | null = null;
let prevSnap: Snapshot | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let unsubs: Array<() => void> = [];
let flushing = false;
let flushAgain = false;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function takeSnapshot(): Snapshot {
  const settings = useSettingsStore.getState();
  const profile = useProfileStore.getState();
  return {
    logs: clone(useExerciseStore.getState().logs),
    water: clone(useWaterStore.getState().logs),
    phase: usePhaseStore.getState().currentPhase,
    goalMl: useWaterStore.getState().goalMl,
    waterReminders: settings.waterReminders,
    morningReminder: settings.morningReminder,
    streakReminder: settings.streakReminder,
    displayName: profile.displayName,
    ageYears: profile.ageYears,
    gender: profile.gender,
  };
}

function asGender(value: string | null | undefined): Gender | null {
  if (value === "male" || value === "female" || value === "other") return value;
  return null;
}

function profilePayload(
  userId: string,
  snap: Pick<
    Snapshot,
    | "phase"
    | "goalMl"
    | "waterReminders"
    | "morningReminder"
    | "streakReminder"
    | "displayName"
    | "ageYears"
    | "gender"
  >
) {
  return {
    id: userId,
    current_phase: snap.phase,
    water_goal_ml: snap.goalMl,
    water_reminders: snap.waterReminders,
    morning_reminder: snap.morningReminder,
    streak_reminder: snap.streakReminder,
    display_name: snap.displayName.trim() || null,
    age_years: snap.ageYears,
    gender: snap.gender,
  };
}

function asPhase(value: number): PhaseNumber {
  if (value === 2 || value === 3 || value === 4) return value;
  return 1;
}

function flattenExerciseLogs(
  userId: string,
  logs: Record<string, CompletionMap>
): Array<{
  user_id: string;
  log_date: string;
  exercise_id: string;
  completed: boolean;
}> {
  const rows: Array<{
    user_id: string;
    log_date: string;
    exercise_id: string;
    completed: boolean;
  }> = [];
  for (const [logDate, day] of Object.entries(logs)) {
    for (const [exerciseId, completed] of Object.entries(day)) {
      rows.push({
        user_id: userId,
        log_date: logDate,
        exercise_id: exerciseId,
        completed: Boolean(completed),
      });
    }
  }
  return rows;
}

function flattenSips(
  userId: string,
  logs: Record<string, WaterEntry[]>
): Array<{
  id: string;
  user_id: string;
  log_date: string;
  ml: number;
  taken_at: string;
}> {
  const rows: Array<{
    id: string;
    user_id: string;
    log_date: string;
    ml: number;
    taken_at: string;
  }> = [];
  for (const [logDate, entries] of Object.entries(logs)) {
    for (const entry of entries) {
      rows.push({
        id: entry.id,
        user_id: userId,
        log_date: logDate,
        ml: entry.ml,
        taken_at: entry.at,
      });
    }
  }
  return rows;
}

function logsFromRows(rows: ExerciseLogRow[]): Record<string, CompletionMap> {
  const logs: Record<string, CompletionMap> = {};
  for (const row of rows) {
    if (!logs[row.log_date]) logs[row.log_date] = {};
    logs[row.log_date][row.exercise_id] = row.completed;
  }
  return logs;
}

function waterFromRows(rows: WaterSipRow[]): Record<string, WaterEntry[]> {
  const logs: Record<string, WaterEntry[]> = {};
  for (const row of rows) {
    if (!logs[row.log_date]) logs[row.log_date] = [];
    logs[row.log_date].push({ id: row.id, ml: row.ml, at: row.taken_at });
  }
  for (const entries of Object.values(logs)) {
    entries.sort((a, b) => a.at.localeCompare(b.at));
  }
  return logs;
}

function rewriteLocalSipIds(): Record<string, WaterEntry[]> {
  const logs = useWaterStore.getState().logs;
  let changed = false;
  const next: Record<string, WaterEntry[]> = {};
  for (const [date, entries] of Object.entries(logs)) {
    next[date] = entries.map((entry) => {
      const id = ensureSipId(entry.id);
      if (id !== entry.id) changed = true;
      return id === entry.id ? entry : { ...entry, id };
    });
  }
  if (changed) {
    applyingRemote = true;
    try {
      useWaterStore.getState().hydrate(useWaterStore.getState().goalMl, next);
    } finally {
      applyingRemote = false;
    }
    return next;
  }
  return logs;
}

function localHasUserData(): boolean {
  const logs = useExerciseStore.getState().logs;
  for (const day of Object.values(logs)) {
    if (Object.values(day).some(Boolean)) return true;
  }
  for (const entries of Object.values(useWaterStore.getState().logs)) {
    if (entries.length > 0) return true;
  }
  if (usePhaseStore.getState().currentPhase !== 1) return true;
  if (useWaterStore.getState().goalMl !== WATER_GOAL_ML) return true;
  const profile = useProfileStore.getState();
  if (profile.displayName.trim() || profile.ageYears != null || profile.gender) {
    return true;
  }
  return false;
}

function resetLocalUserData(): void {
  applyingRemote = true;
  try {
    useExerciseStore.getState().hydrate({});
    useWaterStore.getState().hydrate(WATER_GOAL_ML, {});
    usePhaseStore.getState().hydrate(1);
    useSettingsStore.getState().hydrateReminders({
      waterReminders: true,
      morningReminder: true,
      streakReminder: true,
    });
    useHistoryCacheStore.getState().clear();
    useProfileStore.getState().hydrateProfile({
      displayName: "",
      ageYears: null,
      gender: null,
    });
  } finally {
    applyingRemote = false;
  }
}

async function throwIfError(error: { message: string } | null): Promise<void> {
  if (error) throw new Error(error.message);
}

async function upsertChunked<T extends object>(
  supabase: SupabaseClient,
  table: string,
  rows: T[],
  onConflict: string
): Promise<void> {
  for (let i = 0; i < rows.length; i += UPSERT_CHUNK) {
    const { error } = await supabase
      .from(table)
      .upsert(rows.slice(i, i + UPSERT_CHUNK), { onConflict });
    await throwIfError(error);
  }
}

async function cloudHasRows(supabase: SupabaseClient): Promise<boolean> {
  const [logs, sips] = await Promise.all([
    supabase.from("exercise_logs").select("id", { count: "exact", head: true }),
    supabase.from("water_sips").select("id", { count: "exact", head: true }),
  ]);
  await throwIfError(logs.error);
  await throwIfError(sips.error);
  return (logs.count ?? 0) > 0 || (sips.count ?? 0) > 0;
}

async function uploadLocalSnapshot(
  userId: string,
  supabase: SupabaseClient
): Promise<void> {
  const waterLogs = rewriteLocalSipIds();
  const snap = takeSnapshot();
  snap.water = waterLogs;

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(profilePayload(userId, snap));
  await throwIfError(profileError);

  await upsertChunked(
    supabase,
    "exercise_logs",
    flattenExerciseLogs(userId, snap.logs),
    "user_id,log_date,exercise_id"
  );
  await upsertChunked(
    supabase,
    "water_sips",
    flattenSips(userId, snap.water),
    "id"
  );
}

function pruneStoresToPersistRange(): void {
  const { startKey, endKey } = localPersistRange();
  applyingRemote = true;
  try {
    const logs = useExerciseStore.getState().logs;
    useExerciseStore.getState().hydrate(pickKeyRange(logs, startKey, endKey));
    const water = useWaterStore.getState();
    useWaterStore
      .getState()
      .hydrate(water.goalMl, pickKeyRange(water.logs, startKey, endKey));
  } finally {
    applyingRemote = false;
  }
}

async function pullFromCloud(
  userId: string,
  supabase: SupabaseClient
): Promise<void> {
  const { startKey, endKey } = localPersistRange();
  const [profileRes, logsRes, sipsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase
      .from("exercise_logs")
      .select("log_date, exercise_id, completed")
      .gte("log_date", startKey)
      .lte("log_date", endKey),
    supabase
      .from("water_sips")
      .select("id, log_date, ml, taken_at")
      .gte("log_date", startKey)
      .lte("log_date", endKey),
  ]);
  await throwIfError(profileRes.error);
  await throwIfError(logsRes.error);
  await throwIfError(sipsRes.error);

  let profile = profileRes.data as ProfileRow | null;
  if (!profile) {
    const { error } = await supabase.from("profiles").upsert({ id: userId });
    await throwIfError(error);
    profile = {
      current_phase: 1,
      water_goal_ml: WATER_GOAL_ML,
      water_reminders: true,
      morning_reminder: true,
      streak_reminder: true,
      display_name: null,
      age_years: null,
      gender: null,
    };
  }

  applyingRemote = true;
  try {
    usePhaseStore.getState().hydrate(asPhase(profile.current_phase));
    useSettingsStore.getState().hydrateReminders({
      waterReminders: profile.water_reminders,
      morningReminder: profile.morning_reminder,
      streakReminder: profile.streak_reminder,
    });
    useProfileStore.getState().hydrateProfile({
      displayName: profile.display_name ?? "",
      ageYears: profile.age_years ?? null,
      gender: asGender(profile.gender),
    });
    useExerciseStore
      .getState()
      .hydrate(logsFromRows((logsRes.data ?? []) as ExerciseLogRow[]));
    useWaterStore
      .getState()
      .hydrate(
        profile.water_goal_ml,
        waterFromRows((sipsRes.data ?? []) as WaterSipRow[])
      );
  } finally {
    applyingRemote = false;
  }
}

async function pushDiff(
  userId: string,
  supabase: SupabaseClient,
  prev: Snapshot,
  next: Snapshot
): Promise<void> {
  const profileChanged =
    prev.phase !== next.phase ||
    prev.goalMl !== next.goalMl ||
    prev.waterReminders !== next.waterReminders ||
    prev.morningReminder !== next.morningReminder ||
    prev.streakReminder !== next.streakReminder ||
    prev.displayName !== next.displayName ||
    prev.ageYears !== next.ageYears ||
    prev.gender !== next.gender;

  if (profileChanged) {
    const { error } = await supabase
      .from("profiles")
      .upsert(profilePayload(userId, next));
    await throwIfError(error);
  }

  const dates = new Set([
    ...Object.keys(prev.logs),
    ...Object.keys(next.logs),
  ]);
  const upserts: ReturnType<typeof flattenExerciseLogs> = [];
  for (const date of dates) {
    const prevDay = prev.logs[date];
    const nextDay = next.logs[date];
    if (prevDay && !nextDay) {
      const { error } = await supabase
        .from("exercise_logs")
        .delete()
        .eq("user_id", userId)
        .eq("log_date", date);
      await throwIfError(error);
      continue;
    }
    if (!nextDay) continue;
    const ids = new Set([
      ...Object.keys(prevDay ?? {}),
      ...Object.keys(nextDay),
    ]);
    for (const exerciseId of ids) {
      const prevVal = prevDay?.[exerciseId];
      const nextVal = nextDay[exerciseId];
      if (prevVal === nextVal) continue;
      if (nextVal === undefined) {
        const { error } = await supabase
          .from("exercise_logs")
          .delete()
          .eq("user_id", userId)
          .eq("log_date", date)
          .eq("exercise_id", exerciseId);
        await throwIfError(error);
      } else {
        upserts.push({
          user_id: userId,
          log_date: date,
          exercise_id: exerciseId,
          completed: Boolean(nextVal),
        });
      }
    }
  }
  if (upserts.length > 0) {
    await upsertChunked(
      supabase,
      "exercise_logs",
      upserts,
      "user_id,log_date,exercise_id"
    );
  }

  const prevById = new Map<string, { date: string; entry: WaterEntry }>();
  const nextById = new Map<string, { date: string; entry: WaterEntry }>();
  for (const [date, entries] of Object.entries(prev.water)) {
    for (const entry of entries) prevById.set(entry.id, { date, entry });
  }
  for (const [date, entries] of Object.entries(next.water)) {
    for (const entry of entries) nextById.set(entry.id, { date, entry });
  }

  const sipInserts: ReturnType<typeof flattenSips> = [];
  const sipDeletes: string[] = [];
  for (const [id, { date, entry }] of nextById) {
    if (!prevById.has(id)) {
      sipInserts.push({
        id,
        user_id: userId,
        log_date: date,
        ml: entry.ml,
        taken_at: entry.at,
      });
    }
  }
  for (const id of prevById.keys()) {
    if (!nextById.has(id)) sipDeletes.push(id);
  }
  if (sipInserts.length > 0) {
    await upsertChunked(supabase, "water_sips", sipInserts, "id");
  }
  if (sipDeletes.length > 0) {
    const { error } = await supabase
      .from("water_sips")
      .delete()
      .eq("user_id", userId)
      .in("id", sipDeletes);
    await throwIfError(error);
  }
}

async function flush(): Promise<void> {
  if (applyingRemote || !writeUserId || !writeClient || !prevSnap) return;
  if (flushing) {
    flushAgain = true;
    return;
  }
  flushing = true;
  try {
    const next = takeSnapshot();
    await pushDiff(writeUserId, writeClient, prevSnap, next);
    prevSnap = next;
    const email = useSyncStore.getState().email;
    useSyncStore.getState().setSynced(email);
  } catch (err) {
    const email = useSyncStore.getState().email;
    const message =
      err instanceof Error ? err.message : "Cloud sync failed";
    useSyncStore.getState().setError(email, message);
  } finally {
    flushing = false;
    if (flushAgain) {
      flushAgain = false;
      await flush();
    }
  }
}

function scheduleFlush(): void {
  if (applyingRemote) return;
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    void flush();
  }, DEBOUNCE_MS);
}

export function stopWriteThrough(): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  for (const unsub of unsubs) unsub();
  unsubs = [];
  writeUserId = null;
  writeClient = null;
  prevSnap = null;
  flushing = false;
  flushAgain = false;
}

export function startWriteThrough(
  userId: string,
  supabase: SupabaseClient
): void {
  stopWriteThrough();
  writeUserId = userId;
  writeClient = supabase;
  prevSnap = takeSnapshot();
  unsubs = [
    useExerciseStore.subscribe(scheduleFlush),
    useWaterStore.subscribe(scheduleFlush),
    usePhaseStore.subscribe(scheduleFlush),
    useSettingsStore.subscribe(scheduleFlush),
    useProfileStore.subscribe(scheduleFlush),
  ];
}

export async function flushNow(): Promise<void> {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  await flush();
}

export async function syncOnSignIn(
  userId: string,
  supabase: SupabaseClient
): Promise<void> {
  const owner = getCloudOwnerId();
  const hasCloud = await cloudHasRows(supabase);

  if (owner && owner !== userId) {
    resetLocalUserData();
    await pullFromCloud(userId, supabase);
  } else if (!hasCloud && localHasUserData()) {
    await uploadLocalSnapshot(userId, supabase);
  } else if (hasCloud && owner !== userId) {
    await pullFromCloud(userId, supabase);
  }
  // Same owner: keep local (offline edits) and let write-through push.
  // Trim memory/localStorage to this week after older rows are in the cloud.

  setCloudOwnerId(userId);
  pruneStoresToPersistRange();
}

export function whenStoresHydrated(): Promise<void> {
  const stores = [
    useExerciseStore,
    useWaterStore,
    usePhaseStore,
    useSettingsStore,
    useProfileStore,
  ];
  return Promise.all(
    stores.map(
      (store) =>
        new Promise<void>((resolve) => {
          if (store.persist.hasHydrated()) {
            resolve();
            return;
          }
          const unsub = store.persist.onFinishHydration(() => {
            unsub();
            resolve();
          });
          if (store.persist.hasHydrated()) {
            unsub();
            resolve();
          }
        })
    )
  ).then(() => undefined);
}
