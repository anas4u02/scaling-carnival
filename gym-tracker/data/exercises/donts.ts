import type { DontItem } from "@/types";

export const dontItems: DontItem[] = [
  // ── Permanent ────────────────────────────────────────────────────
  {
    id: "dont1",
    name: "Behind-the-neck press",
    reason: "Maximum cervical compression under load. Permanent.",
    severity: "permanent",
  },
  {
    id: "dont2",
    name: "Behind-the-neck pulldown",
    reason: "Same as above. Permanent.",
    severity: "permanent",
  },
  {
    id: "dont3",
    name: "Crunches / sit-ups",
    reason: "Highest intradiscal pressure at L5-S1. Permanent.",
    severity: "permanent",
  },
  {
    id: "dont4",
    name: "Good mornings",
    reason: "Extreme L5-S1 shear force. Permanent.",
    severity: "permanent",
  },
  {
    id: "dont5",
    name: "Upright rows",
    reason: "Compresses cervical nerve roots on every rep. Permanent.",
    severity: "permanent",
  },

  // ── Phase-Based ──────────────────────────────────────────────────
  {
    id: "dont6",
    name: "Conventional deadlift",
    reason: "Phase 1–3. Revisit with trap bar in Phase 4 with clearance.",
    severity: "phaseBased",
  },
  {
    id: "dont7",
    name: "Barbell back squat",
    reason: "Phase 1–3. Use goblet squat first.",
    severity: "phaseBased",
  },
  {
    id: "dont8",
    name: "Barbell bent-over row",
    reason: "Phase 1–3. Sustained hinge = high L5-S1 shear.",
    severity: "phaseBased",
  },
  {
    id: "dont9",
    name: "Heavy overhead press",
    reason: "Phase 1–2. Light seated DB only from Phase 3.",
    severity: "phaseBased",
  },
  {
    id: "dont10",
    name: "Shrugs",
    reason: "Upper trap overactive — training it worsens cervical imbalance.",
    severity: "phaseBased",
  },
  {
    id: "dont11",
    name: "Weighted dips",
    reason: "Phase 1–3. Forward lean compresses cervical and lumbar.",
    severity: "phaseBased",
  },
  {
    id: "dont12",
    name: "Running (hard surface)",
    reason: "Phase 1–3. Repetitive axial impact on L5-S1.",
    severity: "phaseBased",
  },

  // ── Positions ────────────────────────────────────────────────────
  {
    id: "dont13",
    name: "Sleeping on stomach",
    reason: "Forces maximum cervical rotation. Sets recovery back significantly.",
    severity: "positions",
  },
  {
    id: "dont14",
    name: "Sleeping on right side",
    reason: "Compresses right cervical nerve roots for 6–8 hours.",
    severity: "positions",
  },
  {
    id: "dont15",
    name: "Pillow too high",
    reason: "Forces neck into sustained flexion overnight.",
    severity: "positions",
  },
  {
    id: "dont16",
    name: "Arms overhead while sleeping",
    reason: "Stretches brachial plexus. Worsens right arm tingling.",
    severity: "positions",
  },
  {
    id: "dont17",
    name: "Sitting >40 min without break",
    reason: "Intradiscal pressure rises continuously with sustained sitting.",
    severity: "positions",
  },
  {
    id: "dont18",
    name: "Forward neck flexion (prolonged)",
    reason: "10° sustained flexion = 12 kg effective cervical load. Phone/laptop posture.",
    severity: "positions",
  },
];
