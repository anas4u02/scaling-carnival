import { useState, useEffect, useCallback } from "react";
import { Check, Star, ChevronDown, ChevronUp } from "lucide-react";

// ═══════════════════════════════════════════════════════════
// DATA MODEL
// Each exercise: { id, name, detail, priority, note, sets?,
//   reps?, phase?, maxPhase?, duration? }
// ═══════════════════════════════════════════════════════════

const DAILY = {
    morning: [
        { id: "dm1", name: "90-90 Decompression", detail: "10 min", priority: false, note: "Lie on back, legs on sofa at 90°. Hips and knees both at 90°. Unloads L5-S1 completely before standing." },
        { id: "dm2", name: "Chin Tucks (lying)", detail: "10 × 5 sec", priority: true, note: "Lying flat, gently draw chin straight back. Activates deep cervical flexors without gravity loading." },
        { id: "dm3", name: "Pelvic Tilts", detail: "3 × 15", priority: false, note: "Knees bent, feet flat. Gently press lower back into bed. Hold 3 sec. Foundational L5-S1 mobiliser." },
        { id: "dm4", name: "Cat-Cow", detail: "15 slow cycles", priority: false, note: "Hands and knees. Round spine up (cat), drop belly down (cow). Promotes disc nutrition. Best for morning stiffness." },
        { id: "dm5", name: "Cobra / Sphinx", detail: "3 × 10 sec hold", priority: true, note: "Start on Sphinx (forearms on ground, elbows under shoulders). Progress to full Cobra when comfortable. Stop if leg pain appears." },
    ],
    throughout: [
        { id: "dt1", name: "Chin Tucks (wall)", detail: "10 × 5 sec · Every 2h", priority: true, note: "Stand with back to wall. Draw chin back — back of head moves toward wall. No tilting up or down." },
        { id: "dt2", name: "Scapular Retraction", detail: "15 × 5 sec · Every 2h", priority: true, note: "Squeeze shoulder blades together and slightly down. Hold. Release. Do seated or standing." },
        { id: "dt3", name: "Standing Break + Walk", detail: "2 min · Every 30–40 min", priority: false, note: "Stand, do 5 cat-cows or chin tucks, walk briefly. Resets intradiscal pressure back to baseline." },
        { id: "dt4", name: "Hip Flexor Stretch", detail: "30–45 sec/side · 2× daily", priority: true, note: "Low lunge. Shift hips forward. Feel stretch at front of back hip. Tight hip flexors = direct L5-S1 compression. Critical for desk workers." },
    ],
    evening: [
        { id: "de1", name: "Thoracic Roll Extension", detail: "60–90 sec", priority: true, note: "Rolled towel placed horizontally across mid-upper back at D3-D4 level (behind shoulder blades). Arms crossed over chest. Let gravity extend thoracic spine over roll." },
        { id: "de2", name: "Child's Pose", detail: "60 sec", priority: false, note: "Sit back on heels, stretch arms forward. Gentle lumbar flexion and decompression. Always do after Cobra to balance the spine." },
        { id: "de3", name: "Band Pull-Aparts", detail: "3 × 20", priority: false, note: "Light resistance band at shoulder height, arms straight. Pull apart to full extension. Postural correction before sleep." },
    ],
};

const REHAB = {
    neck: [
        { id: "rn1", name: "Chin Tucks (wall)", detail: "3 × 10 × 5 sec", priority: true, note: "Most important cervical exercise. Wall gives feedback — back of head must contact wall. Builds deep cervical flexors that restore the lordotic curve." },
        { id: "rn2", name: "Lateral Neck Stretch", detail: "2 × 30 sec/side", priority: true, note: "Place right fist behind back (depresses shoulder). Left hand gently tilts head to left. Stretches right scalene and upper trap — directly addresses right-side symptoms." },
        { id: "rn3", name: "Levator Scapulae Stretch", detail: "2 × 20 sec/side", priority: false, note: "Turn head 45° to one side. Look down toward armpit. Gently apply overpressure with same-side hand. Hold." },
        { id: "rn4", name: "Scapular Wall Slides", detail: "3 × 10", priority: false, note: "Back to wall, elbows bent at 90° against wall. Slowly slide arms up keeping elbows and backs of hands in contact throughout." },
        { id: "rn5", name: "Doorway Chest Stretch", detail: "2 × 20–30 sec", priority: false, note: "Forearms on doorframe at shoulder height. Step through gently. Opens pectorals that pull shoulders forward and collapse the cervical curve." },
        { id: "rn6", name: "Scapular Retraction", detail: "3 × 15 × 5 sec", priority: false, note: "Squeeze shoulder blades together and down. Hold. Essential postural correction — do seated or standing, multiple times daily." },
        { id: "rn7", name: "Gentle Cervical Rotation", detail: "2 × 10/side", priority: false, note: "Only when acute flare has settled. Slow, controlled rotation to end range. Avoid forced right rotation until right-side pain significantly improves." },
        { id: "rn8", name: "Chin Tuck + Extension (advanced)", detail: "2 × 10", priority: false, note: "Master basic chin tuck for 4+ weeks first. Perform chin tuck, then add slight upward gaze. Begins active restoration of cervical lordosis — McKenzie approach." },
    ],
    shoulder: [
        { id: "rs1", name: "Face Pulls", detail: "3 × 15–20", priority: true, note: "Cable at eye height, rope attachment. Pull toward face with elbows flared high. Hands finish beside ears. Light weight — form first. Do every single session without exception." },
        { id: "rs2", name: "Rear Delt Flyes", detail: "3 × 15", priority: true, note: "Reverse pec deck or bent-over DB (light). Arms slightly bent, lead with elbows, squeeze at top. Fixes the muscle imbalance driving your cervical and shoulder symptoms." },
        { id: "rs3", name: "Y-T-W Raises", detail: "2 × 10 each shape", priority: true, note: "Face-down on incline bench (30–45°). 2–3 kg only. Y = arms above head diagonally. T = arms straight out to sides. W = elbows bent, thumbs pointing back. Slow and deliberate." },
        { id: "rs4", name: "Band Pull-Aparts", detail: "3 × 20", priority: true, note: "Light band at shoulder height, arms straight. Pull apart to full extension. Direct correction for forward shoulder posture. Do daily — no equipment needed." },
        { id: "rs5", name: "External Rotation", detail: "3 × 15", priority: true, note: "Side-lying with DB or cable at elbow height. Elbow fixed at 90° against side. Rotate forearm upward only. 2–3 kg. C5 nerve root recovery depends on this exercise." },
        { id: "rs6", name: "Scapular Retraction (cable)", detail: "3 × 12 × 5 sec", priority: false, note: "Low cable, both handles, straight arms. Without bending elbows, squeeze shoulder blades together. Hold each rep 3–5 sec. Scapular stability foundation." },
        { id: "rs7", name: "Lateral Raises", detail: "3 × 15", priority: false, note: "Slight forward lean, slight elbow bend. Raise to shoulder height. Don't shrug — if you're shrugging, the weight is too heavy. Zero cervical loading." },
    ],
    lowerBack: [
        { id: "rlb1", name: "Cobra / Sphinx", detail: "3 × 10 × 10 sec", priority: true, note: "Start on Sphinx. Extension pushes disc material anteriorly, away from nerve roots (McKenzie principle). Progress to full Cobra when Sphinx is comfortable." },
        { id: "rlb2", name: "Glute Bridge (pillow)", detail: "3 × 15", priority: true, note: "Pillow between knees (activates glute medius). Drive through heels, squeeze glutes at top. Hold 2 sec. If you feel it in lower back, glutes aren't firing — reduce range." },
        { id: "rlb3", name: "Bird-Dog", detail: "3 × 10/side", priority: true, note: "Hands and knees. Extend opposite arm and leg simultaneously. Hold 5 sec. Return slowly. Multifidus activation with near-zero intradiscal pressure. Do daily." },
        { id: "rlb4", name: "Cat-Cow", detail: "15 slow cycles", priority: false, note: "Best exercise for morning stiffness. Promotes disc nutrition through movement. Do immediately after waking." },
        { id: "rlb5", name: "Child's Pose", detail: "30–60 sec", priority: false, note: "After cobra. Gentle lumbar flexion and decompression. Always counterbalance extension exercises with this." },
        { id: "rlb6", name: "Pelvic Tilts", detail: "3 × 15", priority: false, note: "Lying on back, knees bent. Gently press lower back into floor. Hold 3 sec. Foundational L5-S1 mobility exercise." },
        { id: "rlb7", name: "Hip Flexor Stretch", detail: "30–45 sec/side · 2× daily", priority: true, note: "Low lunge. Shift hips forward until stretch at front of back hip. Tight hip flexors directly increase L5-S1 compression. Critical — do twice daily." },
        { id: "rlb8", name: "90-90 Decompression", detail: "10–15 min", priority: false, note: "Lie on back, legs up on sofa with hips and knees at 90°. Complete L5-S1 unloading. Use every morning and after prolonged sitting." },
    ],
};

const GYM = {
    chest: [
        { id: "gc1", name: "Knee Push-Ups", phase: 1, maxPhase: 1, sets: 3, reps: "10–12", priority: false, note: "Master form before progressing. Neutral neck, core braced, straight line from knees to head." },
        { id: "gc2", name: "Full Push-Ups", phase: 2, maxPhase: 4, sets: 3, reps: "10–15", priority: false, note: "Stop if right arm tingling appears. Neutral neck throughout — don't crane or drop." },
        { id: "gc3", name: "Flat DB Chest Press", phase: 2, maxPhase: 4, sets: 3, reps: "12", priority: false, note: "Feet flat on floor, mild natural arch only. Dumbbells preferred over barbell for shoulder control." },
        { id: "gc4", name: "Incline DB Press", phase: 2, maxPhase: 4, sets: 3, reps: "12", priority: false, note: "Same form as flat. Dumbbells give better shoulder control during the cervical recovery period." },
        { id: "gc5", name: "Cable Crossovers / Flyes", phase: 3, maxPhase: 4, sets: 3, reps: "12–15", priority: false, note: "Low spinal load, excellent isolation. Full range of motion with controlled tempo." },
        { id: "gc6", name: "Flat Barbell Press", phase: 3, maxPhase: 4, sets: 3, reps: "8–10", priority: false, note: "Only when DB press is fully stable. No extreme powerlifter arch. Neck neutral throughout." },
    ],
    shoulders: [
        { id: "gs1", name: "Face Pulls", phase: 1, maxPhase: 4, sets: 3, reps: "15–20", priority: true, note: "EVERY session without exception. Always the first exercise. Eye-height cable, rope attachment, elbows flared high." },
        { id: "gs2", name: "Band Pull-Aparts", phase: 1, maxPhase: 4, sets: 3, reps: "20", priority: true, note: "Light band. Can do daily. Direct correction for forward shoulder posture driving your cervical issues." },
        { id: "gs3", name: "External Rotation", phase: 1, maxPhase: 4, sets: 3, reps: "15", priority: true, note: "2–3 kg. Elbow fixed at 90° at side. Rotate forearm only. C5 nerve root recovery exercise." },
        { id: "gs4", name: "Lateral Raises", phase: 1, maxPhase: 4, sets: 3, reps: "15", priority: false, note: "Don't shrug — weight too heavy if shrugging. Raise to shoulder height. Zero cervical loading." },
        { id: "gs5", name: "Rear Delt Flyes", phase: 2, maxPhase: 4, sets: 3, reps: "15", priority: true, note: "Reverse pec deck or bent-over DB. Fixes the posterior shoulder weakness driving your symptoms." },
        { id: "gs6", name: "Y-T-W Raises", phase: 2, maxPhase: 4, sets: 2, reps: "10 each", priority: true, note: "2–3 kg on incline bench. Y, T, W positions. Precision muscles — don't add load." },
        { id: "gs7", name: "Scapular Wall Slides", phase: 2, maxPhase: 4, sets: 3, reps: "10", priority: false, note: "Trains lower trapezius. Back to wall, maintain contact of forearms and hands throughout." },
        { id: "gs8", name: "Front Raises (light)", phase: 3, maxPhase: 4, sets: 2, reps: "12", priority: false, note: "Light only. Stop immediately if right arm tingling increases." },
        { id: "gs9", name: "Seated DB Shoulder Press", phase: 3, maxPhase: 4, sets: 3, reps: "10–12", priority: false, note: "In front of head ONLY. Light-moderate weight. Sit tall. Stop if tingling. Never heavy, never behind neck." },
    ],
    biceps: [
        { id: "gbi1", name: "DB Bicep Curls", phase: 2, maxPhase: 4, sets: 3, reps: "12", priority: false, note: "Core braced throughout. No back-swinging — that's lumbar load. Controlled tempo." },
        { id: "gbi2", name: "Hammer Curls", phase: 2, maxPhase: 4, sets: 3, reps: "12", priority: false, note: "Neutral grip. Easier on shoulder and forearm. Good choice during cervical recovery." },
        { id: "gbi3", name: "Cable Bicep Curls", phase: 3, maxPhase: 4, sets: 3, reps: "12", priority: false, note: "Consistent tension throughout range. 2 sec up, 2 sec down. No swinging." },
        { id: "gbi4", name: "Incline DB Curls", phase: 3, maxPhase: 4, sets: 3, reps: "10", priority: false, note: "Slight stretch at bottom. Keep shoulders relaxed — don't let them roll forward under load." },
        { id: "gbi5", name: "Preacher Curls", phase: 4, maxPhase: 4, sets: 3, reps: "10", priority: false, note: "Keep spine neutral over pad. Moderate weight." },
    ],
    triceps: [
        { id: "gt1", name: "Close-Grip Push-Ups", phase: 1, maxPhase: 4, sets: 3, reps: "10", priority: false, note: "Elbows close to body. Natural tricep emphasis. Neutral neck." },
        { id: "gt2", name: "Cable Tricep Pushdown", phase: 2, maxPhase: 4, sets: 3, reps: "12–15", priority: false, note: "Best tricep choice for your condition. Standing, neutral spine, forearms parallel to floor at start." },
        { id: "gt3", name: "Tricep Kickbacks (DB)", phase: 2, maxPhase: 4, sets: 3, reps: "12", priority: false, note: "Supported on bench — removes lumbar load. Upper arm parallel to floor throughout." },
        { id: "gt4", name: "Cable Pushdown (rope)", phase: 3, maxPhase: 4, sets: 3, reps: "12", priority: false, note: "Rope allows wrist rotation at bottom for full contraction." },
        { id: "gt5", name: "Overhead Tricep Extension", phase: 3, maxPhase: 4, sets: 3, reps: "12", priority: false, note: "LIGHT weight only. Arms near cervical spine — stop immediately if right arm tingling occurs." },
        { id: "gt6", name: "Skull Crushers (EZ bar)", phase: 4, maxPhase: 4, sets: 3, reps: "10", priority: false, note: "Only in Phase 4 when cervical flare fully settled. Light-moderate weight only." },
    ],
    back: [
        { id: "gbk1", name: "Face Pulls", phase: 1, maxPhase: 4, sets: 3, reps: "15–20", priority: true, note: "Always first in every session. Eye-height cable, rope attachment. Most important exercise." },
        { id: "gbk2", name: "Scapular Retraction", phase: 1, maxPhase: 4, sets: 3, reps: "15 × 5 sec", priority: true, note: "No equipment. Squeeze shoulder blades together and down. Hold each rep. Foundation for all back work." },
        { id: "gbk3", name: "Lat Pulldown (front)", phase: 2, maxPhase: 4, sets: 3, reps: "10–12", priority: true, note: "FRONT only — never behind neck. Pull to upper chest. Lean slightly back. Squeeze blades down and together." },
        { id: "gbk4", name: "Seated Cable Rows", phase: 2, maxPhase: 4, sets: 3, reps: "10–12", priority: true, note: "Upright torso. Pull to lower chest. Squeeze at end. Don't lean back excessively. Best compound back choice." },
        { id: "gbk5", name: "Chest-Supported Row", phase: 2, maxPhase: 4, sets: 3, reps: "10–12", priority: false, note: "Chest pad removes all lumbar load. Use whenever lower back feels fatigued." },
        { id: "gbk6", name: "Pull-Ups", phase: 3, maxPhase: 4, sets: 3, reps: "Max", priority: false, note: "Neutral grip preferred. Neutral neck — don't crane back to look at bar. Hanging gently decompresses lumbar." },
        { id: "gbk7", name: "One-Arm DB Row", phase: 3, maxPhase: 4, sets: 3, reps: "10", priority: false, note: "Knee and hand on bench. Neutral spine. Pull toward hip, not shoulder." },
        { id: "gbk8", name: "Trap Bar Deadlift", phase: 4, maxPhase: 4, sets: 3, reps: "8", priority: false, note: "Physio clearance required first. Start very light. Upright torso, more leg drive. Safer than conventional." },
    ],
    legs: [
        { id: "gl1", name: "Glute Bridge (pillow)", phase: 1, maxPhase: 4, sets: 3, reps: "15", priority: true, note: "Pillow between knees. Drive through heels. Squeeze glutes at top — if feeling it in lower back, glutes not firing." },
        { id: "gl2", name: "Bodyweight Squat", phase: 1, maxPhase: 4, sets: 3, reps: "15", priority: false, note: "Feet shoulder-width, toes slightly out. Sit back like into a chair. Chest up throughout." },
        { id: "gl3", name: "Clamshells", phase: 1, maxPhase: 4, sets: 3, reps: "15/side", priority: false, note: "Side-lying, knees bent, hips stacked. Rotate top knee upward. Glute medius activation for pelvic stability." },
        { id: "gl4", name: "Leg Curl (machine)", phase: 2, maxPhase: 4, sets: 3, reps: "12", priority: false, note: "Seated or prone. Minimal spinal loading. Controlled movement, no jerking." },
        { id: "gl5", name: "Leg Extension (machine)", phase: 2, maxPhase: 4, sets: 3, reps: "12", priority: false, note: "Seated — safe for spine. Controlled movement, don't snap into full extension." },
        { id: "gl6", name: "Goblet Squat", phase: 2, maxPhase: 4, sets: 3, reps: "12", priority: false, note: "DB held at chest. Squat to parallel. Weight at chest significantly reduces lumbar load vs barbell." },
        { id: "gl7", name: "Single-Leg Glute Bridge", phase: 2, maxPhase: 4, sets: 3, reps: "10/side", priority: false, note: "One leg extended, bridge on the other. Much harder than two-leg version. Build stability first." },
        { id: "gl8", name: "Leg Press (machine)", phase: 2, maxPhase: 4, sets: 3, reps: "10–12", priority: false, note: "Back stays fully against pad — if it peels off, you've gone too deep. Don't lock knees at top." },
        { id: "gl9", name: "Bodyweight Lunge", phase: 2, maxPhase: 4, sets: 3, reps: "10/side", priority: false, note: "Torso upright. Front knee tracks over second toe. No barbell until Phase 4." },
        { id: "gl10", name: "Hip Thrust (bodyweight)", phase: 3, maxPhase: 4, sets: 3, reps: "15", priority: true, note: "Shoulders on bench, feet flat, knees bent. Drive hips up explosively. Squeeze glutes hard at top. Foundation for loaded version." },
        { id: "gl11", name: "Cable Pull-Through", phase: 3, maxPhase: 4, sets: 3, reps: "12", priority: false, note: "Low cable between legs. Hip hinge movement. Teaches the deadlift pattern safely with zero spinal shear." },
        { id: "gl12", name: "Bulgarian Split Squat (BW)", phase: 3, maxPhase: 4, sets: 3, reps: "10/side", priority: false, note: "Rear foot on bench, controlled descent. Perfect form before adding any weight." },
        { id: "gl13", name: "Barbell Hip Thrust", phase: 4, maxPhase: 4, sets: 4, reps: "12", priority: true, note: "Progressive load increase over weeks. Safest loaded exercise for L5-S1 long term." },
        { id: "gl14", name: "Trap Bar Deadlift", phase: 4, maxPhase: 4, sets: 3, reps: "8", priority: false, note: "Physio clearance required. Start very light. Most spine-friendly deadlift variation — upright torso." },
        { id: "gl15", name: "Bulgarian Split Squat (weighted)", phase: 4, maxPhase: 4, sets: 3, reps: "10/side", priority: false, note: "Add dumbbells only when bodyweight version is fully stable and controlled." },
    ],
    core: [
        { id: "gco1", name: "Pelvic Tilts", phase: 1, maxPhase: 4, sets: 3, reps: "15", priority: false, note: "Lying on back, knees bent. Gently press lower back into floor. Hold 3 sec. Foundational daily exercise." },
        { id: "gco2", name: "Bird-Dog", phase: 1, maxPhase: 4, sets: 3, reps: "10/side", priority: true, note: "Opposite arm and leg. Hold 5 sec. Return slowly. Most important core exercise for L5-S1. Do daily." },
        { id: "gco3", name: "Dead Bug", phase: 2, maxPhase: 4, sets: 3, reps: "10/side", priority: true, note: "Arms up, knees at 90°. Lower opposite arm and leg to floor slowly. Lower back stays flat — if it arches, shorten the range." },
        { id: "gco4", name: "Forearm Plank", phase: 2, maxPhase: 4, sets: 3, reps: "20–30 sec", priority: true, note: "Hips level — don't sag or pike. Build to 60 sec over 4 weeks. A shorter correct plank > longer sagging plank." },
        { id: "gco5", name: "Side Plank (from knees)", phase: 2, maxPhase: 2, sets: 3, reps: "20 sec/side", priority: false, note: "Knee version first. Lateral stabilizers — essential for L5-S1 stability." },
        { id: "gco6", name: "McGill Curl-Up", phase: 2, maxPhase: 4, sets: 3, reps: "8", priority: false, note: "Hands under lower back (maintains curve). One knee bent. Lift head and shoulders only — NOT a crunch." },
        { id: "gco7", name: "Side Plank (full)", phase: 3, maxPhase: 4, sets: 3, reps: "30–45 sec/side", priority: false, note: "Progress from knee version. Feet stacked or staggered. Add shoulder taps for difficulty." },
        { id: "gco8", name: "Pallof Press", phase: 3, maxPhase: 4, sets: 3, reps: "12/side", priority: false, note: "Cable at chest height. Press straight out and return. Anti-rotation core — very safe for disc conditions." },
        { id: "gco9", name: "Copenhagen Plank", phase: 3, maxPhase: 4, sets: 3, reps: "20–30 sec/side", priority: false, note: "Side plank with top leg on bench. Advanced lateral core challenge." },
        { id: "gco10", name: "Farmer's Carry", phase: 3, maxPhase: 4, sets: 3, reps: "20–30 m", priority: false, note: "Moderate dumbbells. Spine perfectly upright throughout. Functional loaded spinal stability." },
    ],
};

const DONTS = {
    permanent: [
        { name: "Behind-the-neck press", reason: "Maximum cervical compression under load. Permanent." },
        { name: "Behind-the-neck pulldown", reason: "Same as above. Permanent." },
        { name: "Crunches / sit-ups", reason: "Highest intradiscal pressure at L5-S1. Permanent." },
        { name: "Good mornings", reason: "Extreme L5-S1 shear force. Permanent." },
        { name: "Upright rows", reason: "Compresses cervical nerve roots on every rep. Permanent." },
    ],
    phaseBased: [
        { name: "Conventional deadlift", reason: "Phase 1–3. Revisit with trap bar in Phase 4 with clearance." },
        { name: "Barbell back squat", reason: "Phase 1–3. Use goblet squat first." },
        { name: "Barbell bent-over row", reason: "Phase 1–3. Sustained hinge = high L5-S1 shear." },
        { name: "Heavy overhead press", reason: "Phase 1–2. Light seated DB only from Phase 3." },
        { name: "Shrugs", reason: "Upper trap overactive — training it worsens cervical imbalance." },
        { name: "Weighted dips", reason: "Phase 1–3. Forward lean compresses cervical and lumbar." },
        { name: "Running (hard surface)", reason: "Phase 1–3. Repetitive axial impact on L5-S1." },
    ],
    positions: [
        { name: "Sleeping on stomach", reason: "Forces maximum cervical rotation. Sets recovery back significantly." },
        { name: "Sleeping on right side", reason: "Compresses right cervical nerve roots for 6–8 hours." },
        { name: "Pillow too high", reason: "Forces neck into sustained flexion overnight." },
        { name: "Arms overhead while sleeping", reason: "Stretches brachial plexus. Worsens right arm tingling." },
        { name: "Sitting >40 min without break", reason: "Intradiscal pressure rises continuously with sustained sitting." },
        { name: "Forward neck flexion (prolonged)", reason: "10° sustained flexion = 12 kg effective cervical load. Phone/laptop posture." },
    ],
};

const MUSCLES = ["chest", "shoulders", "biceps", "triceps", "back", "legs", "core"];
const MUSCLE_LABELS = { chest: "Chest", shoulders: "Shoulders", biceps: "Biceps", triceps: "Triceps", back: "Back", legs: "Legs", core: "Core" };
const PHASE_LABELS = { 1: "Foundation", 2: "Stability", 3: "Strength", 4: "Performance" };
const PHASE_COLORS = {
    1: { bg: "bg-emerald-500", softBg: "bg-emerald-900/30", border: "border-emerald-500/40", text: "text-emerald-400", badge: "bg-emerald-900/50 border-emerald-600/40 text-emerald-400" },
    2: { bg: "bg-blue-500", softBg: "bg-blue-900/30", border: "border-blue-500/40", text: "text-blue-400", badge: "bg-blue-900/50 border-blue-600/40 text-blue-400" },
    3: { bg: "bg-amber-500", softBg: "bg-amber-900/30", border: "border-amber-500/40", text: "text-amber-400", badge: "bg-amber-900/50 border-amber-600/40 text-amber-400" },
    4: { bg: "bg-purple-500", softBg: "bg-purple-900/30", border: "border-purple-500/40", text: "text-purple-400", badge: "bg-purple-900/50 border-purple-600/40 text-purple-400" },
};

const getTodayKey = () => new Date().toISOString().split("T")[0];

// ═══════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════

export default function GymTracker() {
    const [tab, setTab] = useState("today");
    const [phase, setPhase] = useState(1);
    const [completed, setCompleted] = useState({});
    const [muscle, setMuscle] = useState("back");
    const [rehabSection, setRehabSection] = useState("neck");
    const [history, setHistory] = useState({});
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);
    const [dontsTab, setDontsTab] = useState("permanent");

    const today = getTodayKey();

    useEffect(() => {
        (async () => {
            try {
                const p = await window.storage.get("phase");
                if (p) setPhase(JSON.parse(p.value));
                const c = await window.storage.get(`log-${today}`);
                if (c) setCompleted(JSON.parse(c.value));
                const h = await window.storage.get("history");
                if (h) setHistory(JSON.parse(h.value));
            } catch (_) { }
            setLoading(false);
        })();
    }, []);

    const toggle = useCallback(async (id) => {
        const next = { ...completed, [id]: !completed[id] };
        setCompleted(next);
        try {
            await window.storage.set(`log-${today}`, JSON.stringify(next));
            const total = Object.values(next).filter(Boolean).length;
            const nextH = { ...history, [today]: total };
            setHistory(nextH);
            await window.storage.set("history", JSON.stringify(nextH));
        } catch (_) { }
    }, [completed, history, today]);

    const savePhase = useCallback(async (p) => {
        setPhase(p);
        try { await window.storage.set("phase", JSON.stringify(p)); } catch (_) { }
    }, []);

    const toggleExpand = (id) => setExpanded((prev) => (prev === id ? null : id));

    // ── Exercise Card ──
    const ExCard = ({ ex }) => {
        const done = !!completed[ex.id];
        const isExpanded = expanded === ex.id;
        const detail = ex.detail || (ex.sets && ex.reps ? `${ex.sets} sets × ${ex.reps}` : "");
        return (
            <div className={`rounded-xl border mb-2 overflow-hidden transition-all ${done ? "border-emerald-600/30 bg-emerald-950/20" : "border-gray-700/60 bg-gray-800/40"}`}>
                <div className="flex items-center px-3 py-2.5 gap-3">
                    <button onClick={() => toggle(ex.id)} className="flex-shrink-0">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${done ? "bg-emerald-500 border-emerald-500" : "border-gray-500 hover:border-gray-400"}`}>
                            {done && <Check size={10} className="text-white" strokeWidth={3} />}
                        </div>
                    </button>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {ex.priority && <Star size={10} className="text-amber-400 fill-amber-400 flex-shrink-0" />}
                            <span className={`text-sm font-medium ${done ? "text-gray-500 line-through" : "text-white"}`}>{ex.name}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                            {detail && <span className="text-xs text-gray-400">{detail}</span>}
                            {ex.phase !== undefined && (
                                <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-700/80 text-gray-400">
                                    Ph {ex.phase}{ex.maxPhase && ex.maxPhase > ex.phase ? `–${ex.maxPhase}` : ""}
                                </span>
                            )}
                        </div>
                    </div>
                    {ex.note && (
                        <button onClick={() => toggleExpand(ex.id)} className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${isExpanded ? "bg-gray-600" : "bg-gray-700"}`}>
                            {isExpanded ? <ChevronUp size={12} className="text-gray-300" /> : <ChevronDown size={12} className="text-gray-300" />}
                        </button>
                    )}
                </div>
                {isExpanded && ex.note && (
                    <div className="px-3 pb-3">
                        <div className="text-xs text-gray-400 bg-gray-900/60 rounded-lg p-2.5 leading-relaxed border border-gray-700/30">{ex.note}</div>
                    </div>
                )}
            </div>
        );
    };

    const SectionHead = ({ label, list }) => {
        const done = list.filter((e) => completed[e.id]).length;
        return (
            <div className="flex items-center justify-between mb-2 mt-5 first:mt-0">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</div>
                <div className="text-xs text-gray-500">{done}/{list.length}</div>
            </div>
        );
    };

    // ── Today View ──
    const TodayView = () => {
        const all = [...DAILY.morning, ...DAILY.throughout, ...DAILY.evening];
        const done = all.filter((e) => completed[e.id]).length;
        const pct = all.length ? Math.round((done / all.length) * 100) : 0;
        return (
            <div className="px-4 pb-4">
                <div className="pt-5 pb-3">
                    <div className="text-xs text-gray-500 mb-0.5">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-bold text-white">Daily Essentials</h1>
                        <div className={`text-xs rounded-full px-3 py-1 border ${PHASE_COLORS[phase].badge}`}>Phase {phase}</div>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-500 ${PHASE_COLORS[phase].bg}`} style={{ width: `${pct}%` }} />
                        </div>
                        <div className="text-xs text-gray-400 flex-shrink-0">{done}/{all.length}</div>
                    </div>
                </div>
                <SectionHead label="☀️  Morning — before getting up" list={DAILY.morning} />
                {DAILY.morning.map((e) => <ExCard key={e.id} ex={e} />)}
                <SectionHead label="⏰  Throughout the Day" list={DAILY.throughout} />
                {DAILY.throughout.map((e) => <ExCard key={e.id} ex={e} />)}
                <SectionHead label="🌙  Evening" list={DAILY.evening} />
                {DAILY.evening.map((e) => <ExCard key={e.id} ex={e} />)}
                <div className="mt-5 rounded-xl bg-amber-950/40 border border-amber-700/30 p-3">
                    <div className="text-xs font-medium text-amber-400 mb-1">⚡ Bakody — use anytime</div>
                    <div className="text-xs text-amber-200/70 leading-relaxed">Right arm pain spike? Raise right hand and rest it on top of your head. Immediately slackens the C5 nerve root.</div>
                </div>
            </div>
        );
    };

    // ── Gym View ──
    const GymView = () => {
        const list = (GYM[muscle] || []).filter((e) => e.phase <= phase);
        const done = list.filter((e) => completed[e.id]).length;
        const phaseC = PHASE_COLORS[phase];
        return (
            <div className="px-4 pb-4">
                <div className="pt-5 pb-3">
                    <div className="flex items-center justify-between mb-3">
                        <h1 className="text-xl font-bold text-white">Gym</h1>
                        <div className={`text-xs rounded-full px-3 py-1 border font-medium ${phaseC.badge}`}>{PHASE_LABELS[phase]}</div>
                    </div>
                    {/* Phase selector */}
                    <div className="flex gap-1.5 mb-4">
                        {[1, 2, 3, 4].map((p) => {
                            const c = PHASE_COLORS[p];
                            return (
                                <button key={p} onClick={() => savePhase(p)}
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${phase === p ? `${c.softBg} ${c.border} ${c.text}` : "bg-gray-800 border-gray-700 text-gray-500"}`}>
                                    P{p}
                                </button>
                            );
                        })}
                    </div>
                </div>
                {/* Muscle chips */}
                <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4">
                    {MUSCLES.map((m) => (
                        <button key={m} onClick={() => setMuscle(m)}
                            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${muscle === m ? "bg-white text-gray-900 border-white" : "bg-gray-800 text-gray-400 border-gray-700"}`}>
                            {MUSCLE_LABELS[m]}
                        </button>
                    ))}
                </div>
                {/* Count + face pull reminder */}
                <div className="flex items-center justify-between mt-3 mb-2">
                    <div className="text-xs text-gray-500">{list.length} exercises · Phase 1–{phase}</div>
                    <div className="text-xs text-gray-500">{done}/{list.length}</div>
                </div>
                {(muscle === "shoulders" || muscle === "back") && (
                    <div className="mb-3 rounded-xl bg-amber-950/30 border border-amber-700/30 p-2.5">
                        <div className="text-xs font-medium text-amber-400">⭐ Start with Face Pulls — every session, always first</div>
                    </div>
                )}
                {list.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 text-sm">No exercises in Phase {phase} for {MUSCLE_LABELS[muscle]}.<br />Advance your phase to unlock more.</div>
                ) : (
                    list.map((e) => <ExCard key={e.id} ex={e} />)
                )}
            </div>
        );
    };

    // ── Rehab View ──
    const RehabView = () => {
        const sections = { neck: "Neck", shoulder: "Shoulder", lowerBack: "Lower Back" };
        const list = REHAB[rehabSection] || [];
        const done = list.filter((e) => completed[e.id]).length;
        return (
            <div className="px-4 pb-4">
                <div className="pt-5 pb-3">
                    <h1 className="text-xl font-bold text-white mb-3">Rehab</h1>
                    <div className="flex gap-1.5">
                        {Object.entries(sections).map(([key, label]) => (
                            <button key={key} onClick={() => setRehabSection(key)}
                                className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-colors ${rehabSection === key ? "bg-white text-gray-900 border-white" : "bg-gray-800 text-gray-400 border-gray-700"}`}>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center justify-between mb-3">
                    <div className="text-xs text-gray-500">{list.filter((e) => e.priority).length} priority</div>
                    <div className="text-xs text-gray-500">{done}/{list.length}</div>
                </div>
                {list.map((e) => <ExCard key={e.id} ex={e} />)}
            </div>
        );
    };

    // ── Progress View ──
    const ProgressView = () => {
        // Streak
        let streak = 0;
        const d = new Date();
        for (let i = 0; i < 365; i++) {
            const k = d.toISOString().split("T")[0];
            if (history[k] > 0) { streak++; d.setDate(d.getDate() - 1); }
            else break;
        }
        // 7-day bars
        const days = Array.from({ length: 7 }, (_, i) => {
            const dt = new Date();
            dt.setDate(dt.getDate() - (6 - i));
            const k = dt.toISOString().split("T")[0];
            return { key: k, label: ["S", "M", "T", "W", "T", "F", "S"][dt.getDay()], count: history[k] || 0, isToday: k === today };
        });
        const maxC = Math.max(...days.map((d) => d.count), 1);
        const dontsGroups = { permanent: DONTS.permanent, phaseBased: DONTS.phaseBased, positions: DONTS.positions };
        const dontsLabels = { permanent: "Permanent", phaseBased: "Phase Limits", positions: "Positions" };
        const dontsColors = { permanent: "red", phaseBased: "amber", positions: "orange" };
        return (
            <div className="px-4 pb-4">
                <div className="pt-5 pb-1">
                    <h1 className="text-xl font-bold text-white">Progress</h1>
                </div>
                {/* Streak */}
                <div className="mt-4 rounded-2xl bg-gradient-to-br from-emerald-900/40 to-emerald-950/60 border border-emerald-700/30 p-5 text-center">
                    <div className="text-5xl font-bold text-emerald-400">{streak}</div>
                    <div className="text-sm text-emerald-300/70 mt-1">Day streak 🔥</div>
                    <div className="text-xs text-emerald-400/50 mt-1.5">Today: {Object.values(completed).filter(Boolean).length} done</div>
                </div>
                {/* 7-day chart */}
                <div className="mt-4 rounded-2xl bg-gray-800/40 border border-gray-700/40 p-4">
                    <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-4">Last 7 Days</div>
                    <div className="flex items-end justify-between gap-2 h-20">
                        {days.map((d) => (
                            <div key={d.key} className="flex-1 flex flex-col items-center gap-1">
                                <div className="w-full flex items-end justify-center" style={{ height: "56px" }}>
                                    <div className="w-full rounded-t-md transition-all"
                                        style={{ height: `${d.count > 0 ? Math.max((d.count / maxC) * 56, 8) : 2}px`, background: d.isToday ? "#10b981" : d.count > 0 ? "#059669" : "#374151" }} />
                                </div>
                                <div className={`text-xs ${d.isToday ? "text-white font-bold" : "text-gray-500"}`}>{d.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Don'ts */}
                <div className="mt-5 text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3">The Don'ts</div>
                <div className="flex gap-1.5 mb-4">
                    {Object.keys(dontsGroups).map((key) => (
                        <button key={key} onClick={() => setDontsTab(key)}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${dontsTab === key ? "bg-white text-gray-900 border-white" : "bg-gray-800 text-gray-400 border-gray-700"}`}>
                            {dontsLabels[key]}
                        </button>
                    ))}
                </div>
                {dontsGroups[dontsTab].map((item, i) => (
                    <div key={i} className={`flex items-start gap-2.5 mb-2 rounded-xl p-3 border ${dontsColors[dontsTab] === "red" ? "bg-red-950/30 border-red-800/30" :
                            dontsColors[dontsTab] === "amber" ? "bg-amber-950/30 border-amber-800/30" :
                                "bg-orange-950/30 border-orange-800/30"
                        }`}>
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${dontsColors[dontsTab] === "red" ? "bg-red-500" :
                                dontsColors[dontsTab] === "amber" ? "bg-amber-500" : "bg-orange-500"
                            }`} />
                        <div>
                            <div className={`text-xs font-medium ${dontsColors[dontsTab] === "red" ? "text-red-400" :
                                    dontsColors[dontsTab] === "amber" ? "text-amber-400" : "text-orange-400"
                                }`}>{item.name}</div>
                            <div className={`text-xs mt-0.5 opacity-60 ${dontsColors[dontsTab] === "red" ? "text-red-300" :
                                    dontsColors[dontsTab] === "amber" ? "text-amber-300" : "text-orange-300"
                                }`}>{item.reason}</div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-gray-500 text-sm">Loading your programme...</div>
            </div>
        );
    }

    const TABS = [
        { id: "today", label: "Today", icon: "☀️" },
        { id: "gym", label: "Gym", icon: "🏋️" },
        { id: "rehab", label: "Rehab", icon: "🩺" },
        { id: "progress", label: "Progress", icon: "📊" },
    ];

    return (
        <div className="bg-gray-950 min-h-screen text-white max-w-sm mx-auto flex flex-col">
            <div className="flex-1 overflow-y-auto pb-20">
                {tab === "today" && <TodayView />}
                {tab === "gym" && <GymView />}
                {tab === "rehab" && <RehabView />}
                {tab === "progress" && <ProgressView />}
            </div>
            {/* Bottom nav */}
            <div className="fixed bottom-0 inset-x-0 max-w-sm mx-auto bg-gray-900/95 border-t border-gray-800 backdrop-blur-sm z-50">
                <div className="flex">
                    {TABS.map((t) => (
                        <button key={t.id} onClick={() => setTab(t.id)}
                            className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 transition-colors ${tab === t.id ? "text-white" : "text-gray-500"}`}>
                            <span className="text-base">{t.icon}</span>
                            <span className="text-xs font-medium">{t.label}</span>
                            {tab === t.id && <div className="w-1 h-1 rounded-full bg-emerald-400" />}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}