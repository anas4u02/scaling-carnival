// ─── Exercise Data Types ───────────────────────────────────────────

export type PhaseNumber = 1 | 2 | 3 | 4;

export type MuscleGroup =
  | "chest"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "back"
  | "legs"
  | "core";

export type RehabCondition = "neck" | "shoulder" | "lowerBack";

export type DailySection = "morning" | "throughout" | "evening";

export type DontSeverity = "permanent" | "phaseBased" | "positions";

export type ExerciseCategory = "daily" | "rehab" | "gym";

// Base exercise — all exercises share this shape
export interface BaseExercise {
  id: string;
  name: string;
  priority: boolean;
  note: string;
}

// Daily exercises (morning / throughout / evening)
export interface DailyExercise extends BaseExercise {
  category: "daily";
  section: DailySection;
  detail: string;
}

// Rehab exercises (neck / shoulder / lower back)
export interface RehabExercise extends BaseExercise {
  category: "rehab";
  condition: RehabCondition;
  sets?: number;
  reps?: string;
  detail: string;
}

// Gym exercises — phase-gated, per muscle group
export interface GymExercise extends BaseExercise {
  category: "gym";
  muscle: MuscleGroup;
  phase: PhaseNumber;
  maxPhase: PhaseNumber;
  sets: number;
  reps: string;
  detail: string;
}

export type AnyExercise = DailyExercise | RehabExercise | GymExercise;

// Don'ts
export interface DontItem {
  id: string;
  name: string;
  reason: string;
  severity: DontSeverity;
}

// ─── State Types ───────────────────────────────────────────────────

// Key: exercise ID | Value: boolean (completed)
export type CompletionMap = Record<string, boolean>;

// Key: ISO date string (YYYY-MM-DD) | Value: count of completed exercises
export type HistoryMap = Record<string, number>;

// ─── Store Shapes ─────────────────────────────────────────────────

export interface ExerciseStore {
  logs: Record<string, CompletionMap>;
  toggle: (exerciseId: string, date: string) => void;
  getLog: (date: string) => CompletionMap;
  clearDay: (date: string) => void;
}

export interface PhaseStore {
  currentPhase: PhaseNumber;
  setPhase: (phase: PhaseNumber) => void;
}

export interface HistoryStore {
  getStreak: () => number;
  getLast7Days: () => { date: string; count: number; label: string }[];
}

// ─── Component Prop Types ─────────────────────────────────────────

export interface ExerciseCardProps {
  exercise: AnyExercise;
  isCompleted: boolean;
  onToggle: (id: string) => void;
  showPhaseBadge?: boolean;
  expandedId?: string | null;
  onExpand?: (id: string | null) => void;
}

export interface ExerciseListProps {
  exercises: AnyExercise[];
  completionMap: CompletionMap;
  onToggle: (id: string) => void;
  emptyMessage?: string;
  showPhaseBadge?: boolean;
}

export interface SectionHeaderProps {
  label: string;
  done: number;
  total: number;
}

export interface MuscleChipsProps {
  selected: MuscleGroup;
  onChange: (muscle: MuscleGroup) => void;
}

export interface PhaseSelectorProps {
  current: PhaseNumber;
  onChange: (phase: PhaseNumber) => void;
}

export interface BadgeProps {
  phase: PhaseNumber;
  variant?: "solid" | "soft";
}

export interface ProgressBarProps {
  done: number;
  total: number;
  phase: PhaseNumber;
}

export interface InfoBannerProps {
  variant: "warning" | "danger" | "info";
  title: string;
  message?: string;
}
