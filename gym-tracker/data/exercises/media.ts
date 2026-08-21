import type { ExerciseMedia, MediaSource } from "@/types";

function clip(
  youtubeId: string,
  source: MediaSource,
  extras?: Pick<ExerciseMedia, "image" | "guideUrl" | "youtubeStart">
): ExerciseMedia {
  const start = extras?.youtubeStart;
  const sourceUrl =
    start !== undefined
      ? `https://www.youtube.com/watch?v=${youtubeId}&t=${start}s`
      : `https://www.youtube.com/watch?v=${youtubeId}`;

  return {
    youtubeId,
    source,
    sourceUrl,
    ...extras,
  };
}

/**
 * Shared form clips. Rehab/daily → AskDoctorJo. Gym lifts → ATHLEAN-X.
 * Local stills go in public/media/ and are referenced via `image`.
 */
export const media = {
  // ── Daily / rehab ───────────────────────────────────────────────
  decompression9090: clip("Bzb1gkZrt5c", "askdoctorjo"),
  chinTuckLying: clip("I0mae0RDang", "askdoctorjo"),
  chinTuckWall: clip("zU_58OelcL0", "askdoctorjo"),
  pelvicTilt: clip("6nxQlNDuLCU", "askdoctorjo"),
  catCow: clip("Xm8iSSdU3I0", "askdoctorjo"),
  cobra: clip("UqSP7ZrHxRE", "askdoctorjo"),
  scapularRetraction: clip("ouRhQE2iOI8", "askdoctorjo"),
  sittingBreak: clip("dYOF7xqzQgA", "askdoctorjo"),
  hipFlexor: clip("7bRaX6M2nr8", "askdoctorjo"),
  thoracicExtension: clip("kCoTeRB8c-g", "askdoctorjo"),
  childPose: clip("X-OGH5-gLUs", "askdoctorjo"),
  bandPullAparts: clip("JObYtU7Y7ag", "athleanx"),
  lateralNeckStretch: clip("-r0eoFS7_5Q", "askdoctorjo"),
  levatorScapulae: clip("GSoXPJRnR6E", "askdoctorjo"),
  wallSlides: clip("0x67u3QLQnQ", "askdoctorjo"),
  doorwayChest: clip("NePr1XKRTLU", "askdoctorjo"),
  cervicalRotation: clip("PruXF-NE2zI", "askdoctorjo"),
  chinTuckExtension: clip("HiwOX2evTt4", "askdoctorjo"),
  ytwRaises: clip("ssH35JwmwTM", "athleanx"),
  gluteBridge: clip("ytvP0oUDKYw", "askdoctorjo"),
  birdDog: clip("750nkDg9XPI", "askdoctorjo"),
  clamshells: clip("O2KPabIoPPk", "askdoctorjo"),

  // ── Gym — shoulders / back ──────────────────────────────────────
  facePulls: clip("ljgqer1ZpXg", "athleanx", {
    guideUrl: "https://www.muscleandstrength.com/exercises/face-pull.html",
  }),
  externalRotation: clip("U1hIHwLsiq8", "athleanx"),
  lateralRaises: clip("ENsp0DEryrM", "athleanx", {
    guideUrl: "https://www.muscleandstrength.com/exercises/dumbbell-lateral-raise.html",
  }),
  rearDeltFlyes: clip("dKluhLck1Zs", "athleanx", {
    guideUrl: "https://www.muscleandstrength.com/exercises/bent-over-rear-delt-raise.html",
  }),
  frontRaises: clip("T76xu0XjYTk", "athleanx", {
    guideUrl: "https://www.muscleandstrength.com/exercises/front-dumbbell-raise.html",
  }),
  seatedShoulderPress: clip("Gu1t7X2yq4M", "athleanx", {
    guideUrl: "https://www.muscleandstrength.com/exercises/seated-dumbbell-press.html",
  }),
  latPulldown: clip("SALxEARiMkw", "athleanx", {
    guideUrl: "https://www.muscleandstrength.com/exercises/lat-pull-down.html",
  }),
  seatedCableRow: clip("rnnZr62A94s", "athleanx", {
    guideUrl: "https://www.muscleandstrength.com/exercises/seated-row.html",
  }),
  chestSupportedRow: clip("w4vU3tzVM70", "athleanx"),
  pullUps: clip("sIvJTfGxdFo", "athleanx", {
    guideUrl: "https://www.muscleandstrength.com/exercises/pull-up.html",
  }),
  oneArmRow: clip("gfUg6qWohTk", "athleanx", {
    guideUrl: "https://www.muscleandstrength.com/exercises/one-arm-dumbbell-row.html",
  }),
  trapBarDeadlift: clip("M7-uhQQlIOk", "athleanx", {
    guideUrl: "https://www.muscleandstrength.com/exercises/trap-bar-deadlift.html",
  }),

  // ── Gym — chest / arms ──────────────────────────────────────────
  kneePushUps: clip("AhdtowFDKT0", "athleanx"),
  fullPushUps: clip("iIa2-uVHzM0", "athleanx", {
    guideUrl: "https://www.muscleandstrength.com/exercises/push-up.html",
  }),
  closeGripPushUps: clip("iIa2-uVHzM0", "athleanx"),
  flatDbPress: clip("SzcSrpVr0GA", "athleanx", {
    guideUrl: "https://www.muscleandstrength.com/exercises/dumbbell-bench-press.html",
  }),
  inclineDbPress: clip("BY13DFmEF-s", "athleanx", {
    guideUrl: "https://www.muscleandstrength.com/exercises/incline-dumbbell-bench-press.html",
  }),
  cableFlyes: clip("JUDTGZh4rhg", "athleanx", {
    guideUrl: "https://www.muscleandstrength.com/exercises/cable-crossover.html",
  }),
  barbellPress: clip("vthMCtgVtFw", "athleanx", {
    guideUrl: "https://www.muscleandstrength.com/exercises/barbell-bench-press.html",
  }),
  dbCurl: clip("gozU3CUIizs", "athleanx", {
    guideUrl: "https://www.muscleandstrength.com/exercises/dumbbell-bicep-curl.html",
  }),
  hammerCurl: clip("5RMfId_3Tdc", "athleanx", {
    guideUrl: "https://www.muscleandstrength.com/exercises/hammer-curl.html",
  }),
  cableCurl: clip("gozU3CUIizs", "athleanx", {
    guideUrl: "https://www.muscleandstrength.com/exercises/cable-curl.html",
  }),
  inclineCurl: clip("DCe8f6vMe9A", "athleanx", {
    guideUrl: "https://www.muscleandstrength.com/exercises/incline-dumbbell-curl.html",
  }),
  preacherCurl: clip("gozU3CUIizs", "athleanx", {
    guideUrl: "https://www.muscleandstrength.com/exercises/preacher-curl.html",
  }),
  tricepPushdown: clip("7R88yqmcGrw", "athleanx", {
    guideUrl: "https://www.muscleandstrength.com/exercises/tricep-pushdown.html",
  }),
  tricepKickback: clip("Fwl0T1_giQ0", "athleanx", {
    guideUrl: "https://www.muscleandstrength.com/exercises/tricep-kickback.html",
  }),
  overheadTricep: clip("7R88yqmcGrw", "athleanx", {
    guideUrl: "https://www.muscleandstrength.com/exercises/overhead-dumbbell-extension.html",
  }),
  skullCrushers: clip("gXbSA9EKUtA", "athleanx", {
    guideUrl: "https://www.muscleandstrength.com/exercises/ez-bar-skullcrusher.html",
  }),

  // ── Gym — legs / core ───────────────────────────────────────────
  bodyweightSquat: clip("BZ1TUVr4LFk", "athleanx", {
    guideUrl: "https://www.muscleandstrength.com/exercises/bodyweight-squat.html",
  }),
  legCurl: clip("136r3U-Pewk", "athleanx", {
    guideUrl: "https://www.muscleandstrength.com/exercises/lying-leg-curl.html",
  }),
  legExtension: clip("QXtXEug0PLU", "athleanx", {
    guideUrl: "https://www.muscleandstrength.com/exercises/leg-extension.html",
  }),
  gobletSquat: clip("uYG3CneV-Pw", "athleanx", {
    guideUrl: "https://www.muscleandstrength.com/exercises/goblet-squat.html",
  }),
  singleLegBridge: clip("ytvP0oUDKYw", "askdoctorjo"),
  legPress: clip("QXtXEug0PLU", "athleanx", {
    guideUrl: "https://www.muscleandstrength.com/exercises/leg-press.html",
  }),
  lunge: clip("Pwsn3HR4L90", "athleanx", {
    guideUrl: "https://www.muscleandstrength.com/exercises/lunge.html",
  }),
  hipThrust: clip("pXrlpwmdpI4", "athleanx", {
    guideUrl: "https://www.muscleandstrength.com/exercises/barbell-hip-thrust.html",
  }),
  cablePullThrough: clip("Kb6CktirkEQ", "athleanx", {
    guideUrl: "https://www.muscleandstrength.com/exercises/cable-pull-through.html",
  }),
  bulgarianSplitSquat: clip("hiLF_pF3EJM", "athleanx", {
    guideUrl: "https://www.muscleandstrength.com/exercises/bulgarian-split-squat.html",
  }),
  deadBug: clip("NJ___pbTEkY", "askdoctorjo"),
  forearmPlank: clip("DoYPuzccR-M", "askdoctorjo", {
    guideUrl: "https://www.muscleandstrength.com/exercises/plank.html",
  }),
  sidePlank: clip("9dNL_mtObGQ", "askdoctorjo", {
    guideUrl: "https://www.muscleandstrength.com/exercises/side-plank.html",
  }),
  mcgillCurlUp: clip("gIhCuqtC0r0", "athleanx"),
  pallofPress: clip("EvJxS2951P4", "athleanx", {
    guideUrl: "https://www.muscleandstrength.com/exercises/pallof-press.html",
  }),
  copenhagenPlank: clip("ZyWEXjdAGCQ", "athleanx"),
  farmersCarry: clip("IWxerVP5eps", "athleanx", {
    guideUrl: "https://www.muscleandstrength.com/exercises/farmers-walk.html",
  }),
} satisfies Record<string, ExerciseMedia>;
