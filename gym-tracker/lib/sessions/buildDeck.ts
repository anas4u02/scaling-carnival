import { allExercises } from "@/data";
import {
  GYM_OVERLAP_FAMILIES,
  GYM_SLOTS,
  HOME_SLOTS,
  movements,
  type MovementDef,
} from "@/data/sessions/catalog";
import type { PhaseNumber, SessionCard, SessionMode, SessionRecord } from "@/types";

const BENEFICIAL_COUNT = 3;
const PROMOTION_CAP = 8;

const exerciseById = new Map(allExercises.map((exercise) => [exercise.id, exercise]));

export function coveredFamilies(sessions: SessionRecord[]): Set<string> {
  const covered = new Set<string>();
  for (const session of sessions) {
    for (const exercise of session.exercises) {
      if (exercise.completed) covered.add(exercise.family);
    }
  }
  return covered;
}

export function buildSessionDeck(input: {
  mode: SessionMode;
  phase: PhaseNumber;
  date: string;
  sessions: SessionRecord[];
  debts: Record<string, number>;
}): SessionCard[] {
  const todaySessions = input.sessions.filter((session) => session.date === input.date);
  const gymDay = todaySessions.some((session) => session.mode === "gym");
  const covered = coveredFamilies(todaySessions);
  const slots = input.mode === "gym" ? GYM_SLOTS : HOME_SLOTS;
  const selected = new Set(selectIds(input, gymDay, covered));

  const ordered: MovementDef[] = [];
  for (const slot of slots) {
    const items = slot.ids
      .map((id) => movements[id])
      .filter((movement): movement is MovementDef => Boolean(movement) && selected.has(movement.id));
    ordered.push(...reorderSlot(items, input.debts));
  }

  return ordered.map(toCard);
}

function selectIds(
  input: {
    mode: SessionMode;
    phase: PhaseNumber;
    date: string;
    sessions: SessionRecord[];
  },
  gymDay: boolean,
  coveredToday: Set<string>
): string[] {
  if (input.mode === "gym") {
    return GYM_SLOTS.flatMap((slot) => slot.ids).filter((id) => {
      const movement = movements[id];
      if (!movement || !inPhase(movement, input.phase)) return false;
      if (movement.family === "face-pulls") return true;
      return !coveredToday.has(movement.family);
    });
  }

  const homeIds = HOME_SLOTS.flatMap((slot) => slot.ids);
  let crucial = homeIds.filter((id) => movements[id]?.layer === "crucial");
  if (input.mode === "evening" && gymDay) {
    crucial = crucial.filter((id) => {
      const family = movements[id].family;
      if (!GYM_OVERLAP_FAMILIES.has(family)) return true;
      return !coveredToday.has(family);
    });
  }

  const beneficial = homeIds.filter((id) => movements[id]?.layer === "beneficial");
  let extras: string[] = [];
  if (input.mode === "morning") {
    const recent = coveredFamilies(lastHomeSessions(input.sessions, 2));
    const fresh = beneficial.filter((id) => !recent.has(movements[id].family));
    const stale = beneficial.filter((id) => recent.has(movements[id].family));
    extras = pickPreferring(fresh, stale, `${input.date}:morning`, BENEFICIAL_COUNT);
  } else if (!gymDay) {
    const available = beneficial.filter((id) => !coveredToday.has(movements[id].family));
    extras = pickPreferring(available, [], `${input.date}:evening`, BENEFICIAL_COUNT);
  }

  return [...crucial, ...extras];
}

function inPhase(movement: MovementDef, phase: PhaseNumber): boolean {
  const min = movement.minPhase ?? 1;
  const max = movement.maxPhase ?? 4;
  return phase >= min && phase <= max;
}

function lastHomeSessions(sessions: SessionRecord[], count: number): SessionRecord[] {
  return sessions
    .filter((session) => session.mode === "morning" || session.mode === "evening")
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
    .slice(0, count);
}

function pickPreferring(priority: string[], rest: string[], seedKey: string, count: number): string[] {
  if (priority.length >= count) return pickN(priority, seedKey, count);
  return [...priority, ...pickN(rest, seedKey, count - priority.length)];
}

function pickN(ids: string[], seedKey: string, count: number): string[] {
  if (count <= 0 || ids.length === 0) return [];
  if (ids.length <= count) return ids;
  const start = hashString(seedKey) % ids.length;
  const picked: string[] = [];
  for (let i = 0; i < count; i++) picked.push(ids[(start + i) % ids.length]);
  return picked;
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  return hash;
}

function reorderSlot(items: MovementDef[], debts: Record<string, number>): MovementDef[] {
  if (items.length === 0) return [];
  const present = new Set(items.map((item) => item.id));
  const anchor = items.find((item) => item.anchor);
  const glued = items.filter(
    (item) => item.immediatelyAfter && present.has(item.immediatelyAfter) && item !== anchor
  );
  const gluedIds = new Set(glued.map((item) => item.id));
  const rest = items.filter((item) => item !== anchor && !gluedIds.has(item.id));

  const placed = rest.map((movement, index) => {
    const debt = Math.min(PROMOTION_CAP, debts[movement.family] ?? 0);
    return { movement, index, debt, desired: index - debt };
  });
  placed.sort((a, b) => a.desired - b.desired || b.debt - a.debt || a.index - b.index);

  const ordered = placed.map((item) => item.movement);
  if (anchor) ordered.unshift(anchor);

  for (const movement of glued) {
    const afterIndex = ordered.findIndex((item) => item.id === movement.immediatelyAfter);
    if (afterIndex === -1) {
      ordered.push(movement);
      continue;
    }
    ordered.splice(afterIndex + 1, 0, movement);
  }

  return ordered;
}

function toCard(movement: MovementDef): SessionCard {
  const exercise = exerciseById.get(movement.exerciseId);
  return {
    movementId: movement.id,
    exerciseId: movement.exerciseId,
    family: movement.family,
    name: exercise?.name ?? movement.id,
    note: exercise?.note ?? "",
    dose: movement.dose,
    target: movement.target,
    unit: movement.unit,
    slot: movement.slot,
    layer: movement.layer,
  };
}
