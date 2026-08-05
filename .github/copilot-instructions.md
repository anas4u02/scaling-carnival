# GymTracker — Development Instruction File

> **Compatible with:** GitHub Copilot (`.github/copilot-instructions.md`), Claude Code (`CLAUDE.md`), Cursor (`.cursorrules`), Cline, Windsurf
>
> **Purpose:** Rehabilitation and gym exercise tracker for a patient with L4-L5 and L5-S1 disc bulges, L5-S1 desiccation, cervical spine straightening, and thoracic disc bulges. Mobile-first, offline-capable daily use at the gym.

---

## Table of Contents
1. [Tech Stack](#1-tech-stack)
2. [Project Structure](#2-project-structure)
3. [TypeScript Interfaces — Source of Truth](#3-typescript-interfaces--source-of-truth)
4. [Data Layer](#4-data-layer)
5. [State Management](#5-state-management)
6. [Storage Strategy](#6-storage-strategy)
7. [Feature Specifications](#7-feature-specifications)
8. [Component Architecture](#8-component-architecture)
9. [Routing](#9-routing)
10. [UI / UX Guidelines](#10-ui--ux-guidelines)
11. [Phase System](#11-phase-system)
12. [Coding Conventions](#12-coding-conventions)
13. [PWA Requirements](#13-pwa-requirements)
14. [Known Constraints and Edge Cases](#14-known-constraints-and-edge-cases)
15. [Future Features — v2 Roadmap](#15-future-features--v2-roadmap)

---

## 1. Tech Stack

### Core
| Layer | Choice | Reason |
|---|---|---|
| Framework | **Next.js 14+ (App Router)** | SSG + PWA support, file-based routing, strong TypeScript support |
| Language | **TypeScript 5+ (strict mode)** | Full type safety — no `any`, no implicit `any` |
| Styling | **Tailwind CSS v3** | Utility-first, no runtime overhead, consistent mobile spacing |
| State | **Zustand** | Minimal boilerplate, no provider wrapping, easy persistence middleware |
| Persistence | **localStorage** with Zustand persist middleware (v1), **Dexie.js / IndexedDB** (v2) |
| Icons | **Lucide React** | Lightweight, tree-shakeable, consistent stroke style |
| Date handling | **date-fns** | Lightweight, tree-shakeable, no global state |
| PWA | **next-pwa** | Offline caching critical — user will be at gym without reliable internet |

### Dev Tools
- ESLint + Prettier (enforce formatting)
- Husky + lint-staged (pre-commit hooks)
- Vitest + React Testing Library (unit tests)

### Alternatives if not using Next.js
- Vite + React 18 + React Router v6 — use `vite-plugin-pwa` instead of `next-pwa`
- Angular 20 (Anas's primary stack) — replace Zustand with Signals + local service, Tailwind via `@tailwindcss/vite`

---

## 2. Project Structure

```
gym-tracker/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout — dark bg, meta, PWA manifest link
│   ├── page.tsx                  # Redirects to /today
│   ├── today/
│   │   └── page.tsx
│   ├── gym/
│   │   └── page.tsx
│   ├── rehab/
│   │   └── page.tsx
│   └── progress/
│       └── page.tsx
│
├── components/
│   ├── layout/
│   │   ├── BottomNav.tsx         # 4-tab bottom navigation
│   │   ├── PageHeader.tsx        # Reusable header with phase badge
│   │   └── PageWrapper.tsx       # Max-width, padding, pb-20 for nav
│   ├── exercise/
│   │   ├── ExerciseCard.tsx      # Single exercise row with toggle + expand
│   │   ├── ExerciseList.tsx      # Renders list of ExerciseCards
│   │   └── SectionHeader.tsx     # Section label + done/total count
│   ├── gym/
│   │   ├── MuscleChips.tsx       # Horizontal scrollable muscle selector
│   │   ├── PhaseSelector.tsx     # Phase 1–4 toggle buttons
│   │   └── FacePullReminder.tsx  # Warning banner for shoulders/back
│   ├── progress/
│   │   ├── StreakCard.tsx        # Current streak + today's count
│   │   ├── WeeklyChart.tsx       # 7-day bar chart (no charting lib — pure Tailwind)
│   │   └── DontsList.tsx        # Tabbed don'ts reference
│   ├── rehab/
│   │   └── ConditionTabs.tsx    # Neck / Shoulder / Lower Back selector
│   └── ui/
│       ├── Badge.tsx             # Phase/priority badges
│       ├── ProgressBar.tsx       # Thin completion bar
│       ├── InfoBanner.tsx        # Amber/red alert banners
│       └── CheckCircle.tsx       # Animated check toggle
│
├── data/
│   ├── exercises/
│   │   ├── daily.ts              # Morning / throughout / evening exercises
│   │   ├── rehab.ts              # Neck / shoulder / lowerBack exercises
│   │   ├── gym.ts                # All gym exercises by muscle group
│   │   └── donts.ts              # Permanent / phase-based / position don'ts
│   └── index.ts                  # Re-exports all exercise data
│
├── store/
│   ├── useExerciseStore.ts       # Zustand store — completion state
│   ├── usePhaseStore.ts          # Current phase (1–4)
│   ├── useHistoryStore.ts        # Past session history
│   └── index.ts                  # Re-exports all stores
│
├── hooks/
│   ├── useToggleExercise.ts      # Toggle + persist + history update
│   ├── useStreak.ts              # Calculates current streak from history
│   ├── useTodayProgress.ts       # Returns done/total for today's exercises
│   └── useFilteredExercises.ts   # Returns exercises filtered by phase
│
├── types/
│   └── index.ts                  # All TypeScript interfaces (source of truth)
│
├── lib/
│   ├── dateUtils.ts              # Date formatting helpers
│   └── phaseUtils.ts             # Phase advancement logic
│
├── public/
│   ├── manifest.json             # PWA manifest
│   └── icons/                    # PWA icons (192, 512)
│
└── styles/
    └── globals.css               # Tailwind base + custom scrollbar-hide
```

---

## 3. TypeScript Interfaces — Source of Truth

> All components, stores, and data files must import from `types/index.ts`. Never inline type definitions.

```typescript
// types/index.ts

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
  id: string;             // Unique — format: "dm1", "rn1", "gc1", etc.
  name: string;
  priority: boolean;      // ⭐ exercises shown first, starred in UI
  note: string;           // Form cues and clinical rationale
}

// Daily exercises (morning / throughout / evening)
export interface DailyExercise extends BaseExercise {
  category: "daily";
  section: DailySection;
  detail: string;         // Human-readable detail: "10 min" or "3 × 15"
}

// Rehab exercises (neck / shoulder / lower back)
export interface RehabExercise extends BaseExercise {
  category: "rehab";
  condition: RehabCondition;
  sets?: number;
  reps?: string;          // String because: "10/side", "60 sec", "15–20", "Max"
  detail: string;         // Fallback display if sets/reps not present
}

// Gym exercises — phase-gated, per muscle group
export interface GymExercise extends BaseExercise {
  category: "gym";
  muscle: MuscleGroup;
  phase: PhaseNumber;     // Minimum phase to unlock
  maxPhase: PhaseNumber;  // Phase this exercise is relevant up to
  sets: number;
  reps: string;           // String: "10–12", "Max", "15/side", "60 sec"
}

export type AnyExercise = DailyExercise | RehabExercise | GymExercise;

// Don'ts
export interface DontItem {
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
  // Key: "YYYY-MM-DD" | Value: CompletionMap for that day
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
  history: HistoryMap;
  updateHistory: (date: string, count: number) => void;
  getStreak: () => number;
  getLast7Days: () => { date: string; count: number; label: string }[];
}

// ─── Component Prop Types ─────────────────────────────────────────

export interface ExerciseCardProps {
  exercise: AnyExercise;
  isCompleted: boolean;
  onToggle: (id: string) => void;
}

export interface ExerciseListProps {
  exercises: AnyExercise[];
  completionMap: CompletionMap;
  onToggle: (id: string) => void;
  emptyMessage?: string;
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
```

---

## 4. Data Layer

### File conventions
- Each data file exports a typed array or record — no default exports
- No logic in data files — pure data only
- IDs must be unique across all exercise files (prefix prevents collision)

### ID Prefix Convention
| Category | Prefix | Example |
|---|---|---|
| Daily — morning | `dm` | `dm1`, `dm2` |
| Daily — throughout | `dt` | `dt1`, `dt2` |
| Daily — evening | `de` | `de1`, `de2` |
| Rehab — neck | `rn` | `rn1`, `rn2` |
| Rehab — shoulder | `rs` | `rs1`, `rs2` |
| Rehab — lower back | `rlb` | `rlb1`, `rlb2` |
| Gym — chest | `gc` | `gc1`, `gc2` |
| Gym — shoulders | `gs` | `gs1`, `gs2` |
| Gym — biceps | `gbi` | `gbi1`, `gbi2` |
| Gym — triceps | `gt` | `gt1`, `gt2` |
| Gym — back | `gbk` | `gbk1`, `gbk2` |
| Gym — legs | `gl` | `gl1`, `gl2` |
| Gym — core | `gco` | `gco1`, `gco2` |
| Don'ts | `dont` | `dont1`, `dont2` |

### Example data file structure

```typescript
// data/exercises/gym.ts
import type { GymExercise } from "@/types";

export const gymExercises: Record<MuscleGroup, GymExercise[]> = {
  chest: [
    {
      id: "gc1",
      name: "Knee Push-Ups",
      category: "gym",
      muscle: "chest",
      phase: 1,
      maxPhase: 1,
      sets: 3,
      reps: "10–12",
      priority: false,
      note: "Master form before progressing. Neutral neck, core braced.",
    },
    // ...
  ],
  // ...
};
```

---

## 5. State Management

### Zustand Stores

#### Exercise Store (`store/useExerciseStore.ts`)
```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ExerciseStore } from "@/types";

export const useExerciseStore = create<ExerciseStore>()(
  persist(
    (set, get) => ({
      logs: {},
      toggle: (exerciseId, date) => {
        const currentLog = get().logs[date] ?? {};
        set({
          logs: {
            ...get().logs,
            [date]: {
              ...currentLog,
              [exerciseId]: !currentLog[exerciseId],
            },
          },
        });
      },
      getLog: (date) => get().logs[date] ?? {},
      clearDay: (date) => {
        const { [date]: _, ...rest } = get().logs;
        set({ logs: rest });
      },
    }),
    { name: "gym-tracker-logs" }
  )
);
```

#### Phase Store (`store/usePhaseStore.ts`)
```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PhaseStore } from "@/types";

export const usePhaseStore = create<PhaseStore>()(
  persist(
    (set) => ({
      currentPhase: 1,
      setPhase: (phase) => set({ currentPhase: phase }),
    }),
    { name: "gym-tracker-phase" }
  )
);
```

#### History Store (`store/useHistoryStore.ts`)
- History is derived from exercise logs — don't store separately
- `getStreak()` walks backward from today counting days where `count > 0`
- `getLast7Days()` returns array of `{ date, count, label }` for the chart

### State rules
- Never duplicate state — if it can be derived, derive it
- `CompletionMap` for today is always `logs[todayKey] ?? {}`
- Phase is the only globally-persisted UI state
- History derived from logs, not stored independently

---

## 6. Storage Strategy

### v1 — localStorage via Zustand persist
```typescript
// Each store uses { name: "gym-tracker-[entity]" } in persist config
// Data auto-serialises to JSON in localStorage
// Keys used:
//   "gym-tracker-logs"    → ExerciseStore.logs
//   "gym-tracker-phase"   → PhaseStore.currentPhase
```

### v2 — IndexedDB via Dexie.js (planned)
```typescript
// When localStorage limits approached or offline sync needed:
// db.ts — Dexie database schema
// Tables: exercises_log, user_settings, history
// Migrate from localStorage on first v2 load
```

### Storage key conventions
- All localStorage keys prefixed with `gym-tracker-`
- Never use raw `localStorage.setItem` — always go through Zustand persist
- Date keys always ISO format: `YYYY-MM-DD` (use `date-fns/format` with `"yyyy-MM-dd"`)

---

## 7. Feature Specifications

### Tab 1 — Today

**Purpose:** Daily essentials checklist. The most important tab — used every morning before the gym.

**Behaviour:**
- Shows today's date (formatted: "Wednesday, 5 August 2026")
- Phase badge (top right) — current phase with colour
- Progress bar — exercises completed / total for today
- Three collapsible sections: Morning · Throughout the Day · Evening
- Each section shows done/total count
- Exercises completed today are checked and dimmed (not hidden — user must see what's done)
- Amber info banner at bottom: Bakody position reminder (static, not completable)
- Completion state resets at midnight (new day = new log entry)

**Priority exercises** (`priority: true`) show a ⭐ star icon and appear first within their section.

**Empty state:** Not possible — daily exercises are always present.

---

### Tab 2 — Gym

**Purpose:** Log gym workout by muscle group. Phase-gated exercise list.

**Behaviour:**
- Phase selector (P1 / P2 / P3 / P4) — tapping a phase saves it globally
- Horizontal scrollable muscle chip selector: Chest · Shoulders · Biceps · Triceps · Back · Legs · Core
- Exercises filtered to: `exercise.phase <= currentPhase`
- Done/total count shown per muscle group view
- Face Pull reminder banner shown when Shoulders or Back is selected
- Each exercise card: name, sets × reps, phase range badge, expand chevron for notes
- Completed exercises remain visible but dimmed/struck-through
- Completion persists across tabs (same store)

**Phase advancement gate:**
- Phase selector is unrestricted — user can set any phase
- Do not add validation preventing advancement (user's physio may have cleared them)
- Add a subtle "Are you sure?" confirmation modal when advancing to next phase

**Empty state message:** "No exercises available for [muscle] in Phase [n]. Advance your phase to unlock more."

---

### Tab 3 — Rehab

**Purpose:** Condition-specific rehabilitation exercises.

**Three sections:**
- **Neck** — Cervical straightening, C5 nerve root irritation
- **Shoulder** — Cervicogenic shoulder pain, scapular dysfunction
- **Lower Back** — L4-L5 and L5-S1 disc bulges, multifidus strengthening

**Behaviour:**
- Segmented control at top (Neck / Shoulder / Lower Back)
- Priority exercises listed first, marked with ⭐
- Completion state shared with main exercise store (same IDs)
- All rehab exercises are available regardless of phase

---

### Tab 4 — Progress

**Purpose:** Streak, history chart, and Don'ts reference.

**Three sections:**

**Streak card:**
- Large number: current consecutive day streak
- Today's completed count
- "Day streak 🔥" label
- Phase badge

**7-day chart:**
- Pure Tailwind implementation — no charting library
- Bars height proportional to exercises completed that day
- Today's bar highlighted (white/brighter)
- Day labels: S M T W T F S

**Don'ts (tabbed):**
- Three tabs: Permanent · Phase Limits · Positions
- Permanent items: red colour scheme
- Phase-based items: amber colour scheme
- Position items: orange colour scheme
- Items are reference-only — no completion tracking

---

### Exercise Card Behaviour

```
Default state:     [ ○ ] Exercise Name                    [∨]
                         3 sets × 15   Ph 1–4

Completed state:   [ ✓ ] ~~Exercise Name~~                [∨]
                         3 sets × 15   Ph 1–4

Expanded state:    [ ○ ] Exercise Name                    [∧]
                         3 sets × 15   Ph 1–4
                   ┌─────────────────────────────────────────┐
                   │ Form cue / clinical note text here...   │
                   └─────────────────────────────────────────┘
```

- Only one card expanded at a time (accordion behaviour)
- Priority exercises render `<Star />` icon before name
- Phase badge only shown in Gym tab (not in Daily/Rehab)
- Tap anywhere on the row except the chevron toggles completion
- Tap chevron expands/collapses note

---

## 8. Component Architecture

### Component rules
- Every component is a named export (no default exports except pages)
- Props always typed — no inline type definitions in component files
- No business logic in components — extract to hooks
- No store calls inside sub-components — pass data and callbacks as props
- Pages handle store calls and pass data down

### ExerciseCard.tsx
```typescript
// Presentational only — no store access
// Receives: exercise, isCompleted, onToggle
// Internal state: isExpanded (useState)
// Animation: transition-all on border/bg colour change
```

### ExerciseList.tsx
```typescript
// Renders sorted array: priority first, then alphabetical
// Passes onToggle and isCompleted(id) to each ExerciseCard
// Shows empty state if exercises.length === 0
```

### BottomNav.tsx
```typescript
// Fixed bottom, max-w-sm centered
// 4 tabs: Today ☀️ · Gym 🏋️ · Rehab 🩺 · Progress 📊
// Active tab: white text + emerald dot indicator
// Inactive: gray-500 text
// Uses Next.js usePathname() for active detection
// bg-gray-900/95 with backdrop-blur-sm
```

### PageWrapper.tsx
```typescript
// Wraps all page content
// className: "max-w-sm mx-auto bg-gray-950 min-h-screen pb-20 px-4"
// pb-20 accounts for bottom nav height
```

---

## 9. Routing

```
/          → redirect to /today
/today     → TodayView
/gym       → GymView
/rehab     → RehabView
/progress  → ProgressView
```

Next.js App Router — each route is `app/[tab]/page.tsx`. Bottom nav uses `<Link>` components. No dynamic routes in v1.

**Tab state preservation:** Use `searchParams` or URL state to preserve selected muscle group and rehab section when navigating away and back.

```typescript
// Example: /gym?muscle=back
// Read with: const muscle = searchParams.get("muscle") ?? "back"
// Write with: router.replace(`/gym?muscle=${selected}`)
```

---

## 10. UI / UX Guidelines

### Colour System
```
Background:         bg-gray-950  (#030712)
Card surface:       bg-gray-800/40
Card border:        border-gray-700/60
Completed card:     bg-emerald-950/20, border-emerald-600/30
Text primary:       text-white
Text secondary:     text-gray-400
Text tertiary:      text-gray-500
```

### Phase Colours (consistent across all uses)
```
Phase 1 — Foundation:   emerald  (#10b981)
Phase 2 — Stability:    blue     (#3b82f6)
Phase 3 — Strength:     amber    (#f59e0b)
Phase 4 — Performance:  purple   (#a855f7)
```

### Typography
```
Page title:         text-xl font-bold text-white
Section label:      text-xs font-semibold text-gray-400 uppercase tracking-wider
Exercise name:      text-sm font-medium text-white
Detail/reps:        text-xs text-gray-400
Note text:          text-xs text-gray-400 leading-relaxed
Badge text:         text-xs font-medium
```

### Spacing
```
Page horizontal padding:  px-4
Card padding:             p-3 (row), p-2.5 (expanded note)
Card margin bottom:       mb-2
Section gap:              mt-5
```

### Mobile-first Rules
- Max width: `max-w-sm` (384px) — always centered on desktop
- No horizontal scroll except muscle chip selector
- Touch targets minimum 44px height for all interactive elements
- Bottom nav height: 56px (`py-2.5` + icon + label)
- No hover-only states — all interactions must work with touch

### Dark Mode
- App is dark mode only — no light mode toggle in v1
- `bg-gray-950` background — not pure black (reduces eye strain in gym lighting)

### Animation
- Card completion toggle: `transition-all duration-200`
- Progress bar fill: `transition-all duration-500`
- No heavy animations — gym environment requires fast, clear UI

---

## 11. Phase System

### Phase definitions
| Phase | Name | Duration | Advancement criteria |
|---|---|---|---|
| 1 | Foundation | Weeks 1–4 | All Phase 1 exercises pain-free for 2 weeks |
| 2 | Stability | Weeks 4–8 | 60-sec plank, single-leg bridge stable |
| 3 | Strength | Weeks 8–16 | Hip thrust strong, no sitting pain daily |
| 4 | Performance | Month 4+ | Physio clearance, functional stability |

### Phase filtering logic
```typescript
// In useFilteredExercises hook:
const filtered = gymExercises[muscle].filter(
  (ex) => ex.phase <= currentPhase
);

// Sorted: priority first, then by phase ascending, then by name
const sorted = filtered.sort((a, b) => {
  if (a.priority !== b.priority) return a.priority ? -1 : 1;
  if (a.phase !== b.phase) return a.phase - b.phase;
  return a.name.localeCompare(b.name);
});
```

### Phase advancement modal
```typescript
// Show confirmation when user selects phase > currentPhase
// Title: "Advance to Phase [n]?"
// Body: "Make sure your physio has cleared you before progressing.
//        All Phase [n] exercises will be unlocked."
// Buttons: Cancel | Confirm
```

---

## 12. Coding Conventions

### File naming
```
Components:     PascalCase.tsx         ExerciseCard.tsx
Hooks:          camelCase with use      useStreak.ts
Stores:         camelCase with use      usePhaseStore.ts
Data files:     camelCase               daily.ts, gym.ts
Type file:      index.ts in /types
Utilities:      camelCase               dateUtils.ts
Pages:          page.tsx               (Next.js convention)
```

### Import order
```typescript
// 1. React
import { useState, useEffect } from "react";

// 2. Next.js
import { useRouter, useSearchParams } from "next/navigation";

// 3. Third-party libraries
import { format, isToday } from "date-fns";
import { Star, Check } from "lucide-react";

// 4. Internal — types
import type { GymExercise, PhaseNumber } from "@/types";

// 5. Internal — stores
import { usePhaseStore } from "@/store/usePhaseStore";

// 6. Internal — hooks
import { useFilteredExercises } from "@/hooks/useFilteredExercises";

// 7. Internal — components
import { ExerciseCard } from "@/components/exercise/ExerciseCard";

// 8. Internal — data
import { gymExercises } from "@/data/exercises/gym";

// 9. Styles (if any)
import styles from "./Component.module.css";
```

### Component template
```typescript
import type { ExerciseCardProps } from "@/types";

export function ExerciseCard({ exercise, isCompleted, onToggle }: ExerciseCardProps) {
  // 1. Hooks first
  // 2. Derived state / computed values
  // 3. Event handlers
  // 4. Render
  return (...);
}
```

### TypeScript strictness rules
- `strict: true` in tsconfig — no exceptions
- No `any` — use `unknown` and narrow, or define proper types
- No non-null assertions (`!`) unless absolutely necessary and commented
- Prefer type inference where unambiguous — don't over-annotate
- Use `as const` for literal arrays and objects used as data

### CSS / Tailwind rules
- No inline `style={{}}` except for dynamic values that Tailwind cannot express (e.g. bar heights in chart)
- No custom CSS files except `globals.css` for Tailwind base imports and `scrollbar-hide`
- Prefer Tailwind's responsive prefixes over media query CSS
- Dark mode: class-based (`dark:`) not media query

---

## 13. PWA Requirements

This app must work fully offline. The user will be at the gym with no internet.

### next-pwa config
```javascript
// next.config.js
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: "CacheFirst",
      options: {
        cacheName: "gym-tracker-cache",
        expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
  ],
});
```

### manifest.json
```json
{
  "name": "GymTracker",
  "short_name": "GymTracker",
  "description": "Personalised rehabilitation and gym exercise tracker",
  "start_url": "/today",
  "display": "standalone",
  "background_color": "#030712",
  "theme_color": "#030712",
  "orientation": "portrait",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### Offline behaviour
- All exercise data is static and bundled — no API calls needed
- localStorage data is always available offline
- No loading spinners for data (everything is local)
- Only potential failure: first load without cache — handle gracefully

---

## 14. Known Constraints and Edge Cases

### Data constraints
- Exercise IDs must be globally unique across all data files — enforce with a test
- `reps` field is always a `string` — never `number` — because values like "10/side", "Max", "60 sec" are valid
- `detail` is the display fallback — always populate even when `sets` and `reps` exist
- `maxPhase` must always be `>= phase` — enforce with a TypeScript constraint or runtime check in dev

### UI edge cases
```typescript
// 1. Midnight reset
// Completion state is keyed by date — new day = new empty log
// No explicit reset needed — logs[newDate] is undefined → treated as {}

// 2. Phase downgrade
// If user sets phase to lower value, exercises from higher phases remain in logs
// Do not clear logs on phase change — user may have completed them

// 3. Very long exercise names
// ExerciseCard: exercise name truncates to 2 lines max (line-clamp-2)
// Full name visible in expanded note section

// 4. First launch
// No history, no phase set — show Phase 1 as default, empty history = 0 streak
// Do not show an empty chart — show 7 bars with height 2px (minimum)

// 5. All exercises completed
// Progress bar fills to 100% — show ✓ checkmark instead of count
// Celebratory state: "All done today!" message below progress bar

// 6. localStorage unavailable (private browsing, storage full)
// Zustand persist will fail silently
// App still functions — state just doesn't persist across refresh
// Do not show error — graceful degradation
```

### Clinical constraints
- Do not add any exercises to the data files that are listed in DONTS
- If a user navigates to the Don'ts list and taps an item, it should not be toggleable
- The Bakody reminder must always be visible on the Today tab — never dismissable
- Phase 4 exercises must never appear in Phase 1 regardless of filtering bugs — add a guard

---

## 15. Future Features — v2 Roadmap

### Weight and rep logging
```typescript
// Extend GymExercise log to track per-set detail
interface SetLog {
  setNumber: number;
  weight: number;        // kg
  repsCompleted: number;
  perceivedEffort?: 1 | 2 | 3 | 4 | 5; // RPE 1–5 simplified
}

interface ExerciseSessionLog {
  exerciseId: string;
  date: string;
  sets: SetLog[];
  notes?: string;
}
```

### Pain tracking
```typescript
// Daily pain check-in before showing Today exercises
interface PainEntry {
  date: string;
  neckPain: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  lowerBackPain: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  shoulderPain: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  dizziness: boolean;
  rightArmTingling: boolean;
  notes?: string;
}
// If any value >= 7, show "Consider resting today" banner
// If dizziness is true, show "Do not gym today — see doctor" alert
```

### Progress charts (v2)
- Line chart: pain over time (per condition)
- Bar chart: weekly exercise volume
- Streak calendar (GitHub contribution-style)
- Use Recharts or Visx — not Chart.js (too heavy)

### Physiotherapy session log
```typescript
interface PhysioSession {
  id: string;
  date: string;
  physioName: string;
  phaseAdvanced?: boolean;
  newExercisesAdded: string[];    // exercise IDs
  exercisesModified: string[];
  notes: string;
}
```

### Notifications (PWA)
- Morning reminder: "Time for your daily essentials ☀️" (9:00 AM)
- Gym reminder: configurable day/time
- "You missed yesterday — streak at risk" alert
- Web Push API via service worker

### Exercise video links
```typescript
// Extend BaseExercise with optional video
interface BaseExercise {
  // ...existing fields...
  videoUrl?: string;    // YouTube embed or hosted short video
}
```

### Multi-user / family support
- Currently single-user (localStorage keyed without user ID)
- v2: user profile selection on first launch
- Local-only — no backend, no accounts

### Data export
- Export full history as JSON or CSV
- Print-friendly PDF of current phase exercises
- Share progress as image (canvas-based)

### Backend sync (v3, if needed)
- Supabase (PostgreSQL + realtime) as backend
- Auth via phone number (no password)
- Sync across devices — phone + tablet
- Backup / restore from cloud

---

## Appendix A — Immediate First Steps for Code Agent

When starting implementation, follow this exact order:

1. Scaffold Next.js project with TypeScript strict mode and Tailwind
2. Create `types/index.ts` with all interfaces — nothing else until this is complete
3. Populate all data files (`daily.ts`, `rehab.ts`, `gym.ts`, `donts.ts`) — pure data, no logic
4. Implement Zustand stores with persist middleware
5. Implement custom hooks (`useFilteredExercises`, `useStreak`, `useTodayProgress`)
6. Build `ExerciseCard` and `ExerciseList` UI components — pure presentational
7. Build `BottomNav` and `PageWrapper`
8. Implement Today page — wire stores to UI
9. Implement Gym page with muscle chips and phase selector
10. Implement Rehab page
11. Implement Progress page (streak + chart + don'ts)
12. Configure next-pwa and manifest.json
13. Test offline behaviour
14. Write unit tests for stores and hooks

---

## Appendix B — Do Not Do These

- Do not use `any` type — ever
- Do not put business logic in components
- Do not store derived state (history count is derived from logs)
- Do not add exercises from the Don'ts list to any exercise data file
- Do not use `localStorage` directly — always via Zustand persist
- Do not use `<form>` elements — use `onClick` handlers
- Do not add a light mode in v1
- Do not add user accounts or authentication in v1
- Do not make any API calls — all data is local and static
- Do not use CSS modules — Tailwind only
- Do not add a charting library in v1 — the 7-day chart is pure Tailwind bars
- Do not use `default export` in components or hooks — named exports only
- Do not nest Zustand stores — one store per domain
- Do not let phase advancement unlock exercises beyond Phase 4

---

*Patient: Mohammad Anas Abid | Age: 23 | Conditions: L4-L5 disc bulge · L5-S1 desiccation + disc bulge · Cervical straightening · D3-D4 and D4-D5 thoracic disc bulges · Right C5 nerve root irritation*

*Exercise data based on MRI findings from Fidelity Diagnostics (10-04-2026) and clinical notes from Deenanath Mangeshkar Hospital, Department of Back Pain and Spine Clinic.*