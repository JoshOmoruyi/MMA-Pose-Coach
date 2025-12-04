// poseAnalysis.js
import { calculateAngle } from "./angleutils";
import { smoothAngles } from "./angleStabilizer";
import { smoothFeedback } from "./feedbackStabilizer";

// --------- helpers ---------
function valid(k) {
  return k && k.score > 0.35;
}

// Safe rotation between two joints (returns null instead of NaN)
function safeRotation(a, b) {
  if (
    !a || !b ||
    a.x == null || a.y == null ||
    b.x == null || b.y == null
  ) {
    return null;
  }
  return Math.atan2(b.y - a.y, b.x - a.x) * (180 / Math.PI);
}

let prevShoulderRot = null;
let prevHipRot = null;

function smoothRotation(prev, value) {
  if (value == null || Number.isNaN(value)) return prev;
  if (prev == null) return value;
  return prev * 0.8 + value * 0.2; // EMA smoothing
}

// ---------------- MAIN ANALYSIS ----------------
export function analyzePose(kp, mode = "coach") {
  // Nothing detected at all
  if (!kp || kp.length === 0) {
    return {
      messages: ["Move closer to the camera", "Face forward"],
      angles: {},
      shoulderRotation: null,
      shoulderRotationScore: 0,
      hipRotation: null,
      hipRotationScore: 0,
    };
  }

  const K = Object.fromEntries(kp.map((k) => [k.name, k]));
  const messages = [];

  const {
    left_shoulder: LS,
    right_shoulder: RS,
    left_elbow: LE,
    right_elbow: RE,
    left_wrist: LW,
    right_wrist: RW,
    left_hip: LH,
    right_hip: RH,
    left_knee: LK,
    right_knee: RK,
    left_ankle: LA,
    right_ankle: RA,
  } = K;

  // Need torso visible
  if (!(valid(LS) && valid(RS) && valid(LH) && valid(RH))) {
    return {
      messages: ["Pose not stable enough", "Center your body"],
      angles: {},
      shoulderRotation: null,
      shoulderRotationScore: 0,
      hipRotation: null,
      hipRotationScore: 0,
    };
  }

  // ---------- JOINT ANGLES ----------
  const rawAngles = {
    leftElbow:  valid(LS) && valid(LE) && valid(LW) ? calculateAngle(LS, LE, LW) : null,
    rightElbow: valid(RS) && valid(RE) && valid(RW) ? calculateAngle(RS, RE, RW) : null,
    leftKnee:   valid(LH) && valid(LK) && valid(LA) ? calculateAngle(LH, LK, LA) : null,
    rightKnee:  valid(RH) && valid(RK) && valid(RA) ? calculateAngle(RH, RK, RA) : null,
  };

  const angles = smoothAngles(rawAngles);

  // ---------- SHOULDER ROTATION ----------
  let shoulderRotation = safeRotation(LS, RS);
  if (shoulderRotation != null) {
    shoulderRotation = Math.abs(shoulderRotation - 180);
    shoulderRotation = Math.max(0, Math.min(90, shoulderRotation));
    shoulderRotation = smoothRotation(prevShoulderRot, shoulderRotation);
    prevShoulderRot = shoulderRotation;
  }

  let shoulderRotationScore = 0;
  if (shoulderRotation != null) {
    shoulderRotationScore =
      shoulderRotation > 65 ? 95 :
      shoulderRotation > 50 ? 80 :
      shoulderRotation > 35 ? 60 :
      shoulderRotation > 20 ? 40 : 20;
  }

  // ---------- HIP ROTATION ----------
  let hipRotation = safeRotation(LH, RH);
  if (hipRotation != null) {
    hipRotation = Math.abs(hipRotation - 180);
    hipRotation = Math.max(0, Math.min(90, hipRotation));
    hipRotation = smoothRotation(prevHipRot, hipRotation);
    prevHipRot = hipRotation;
  }

  let hipRotationScore = 0;
  if (hipRotation != null) {
    hipRotationScore =
      hipRotation > 60 ? 95 :
      hipRotation > 45 ? 80 :
      hipRotation > 30 ? 60 :
      hipRotation > 15 ? 40 : 20;
  }

  // ======== MODE OVERRIDE: SHADOWBOXING ========
  if (mode === "shadowboxing") {
    return {
      messages: ["Shadowboxing mode active — throw punches!"],
      angles,
      shoulderRotation,
      shoulderRotationScore,
      hipRotation,
      hipRotationScore,
    };
  }

  // ======== COACH MODE FEEDBACK ========

  // Elbows
  if (angles.leftElbow && angles.leftElbow > 130)
    messages.push("Left elbow too wide");
  if (angles.rightElbow && angles.rightElbow > 130)
    messages.push("Right elbow too wide");

  // Hip rotation text only if we have a real value
  if (hipRotation != null) {
    if (hipRotation < 20) messages.push("Rotate your hips more into the strike");
    else if (hipRotation > 60) messages.push("Good hip rotation");
  }

  if (messages.length === 0) {
    messages.push("Solid form");
  }

  const smoothedMessages = smoothFeedback(messages);

  return {
    messages: smoothedMessages,
    angles,
    shoulderRotation,
    shoulderRotationScore,
    hipRotation,
    hipRotationScore,
  };
}
