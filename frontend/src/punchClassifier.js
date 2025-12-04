// src/punchClassifier.js

export function classifyPunch(keypoints, leftVel, rightVel) {
  const LW = keypoints.find(k => k.name === "left_wrist");
  const RW = keypoints.find(k => k.name === "right_wrist");
  const LE = keypoints.find(k => k.name === "left_elbow");
  const RE = keypoints.find(k => k.name === "right_elbow");
  const LS = keypoints.find(k => k.name === "left_shoulder");
  const RS = keypoints.find(k => k.name === "right_shoulder");

  const MIN_SPEED = 900;   // threshold (pixel/sec)
  const HOOK_ANGLE_MIN = 70; 
  const HOOK_ANGLE_MAX = 110;

  function elbowAngle(a, b, c) {
    if (!a || !b || !c) return null;
    const BA = { x: a.x - b.x, y: a.y - b.y };
    const BC = { x: c.x - b.x, y: c.y - b.y };
    const dot = BA.x * BC.x + BA.y * BC.y;
    const mag = Math.hypot(BA.x, BA.y) * Math.hypot(BC.x, BC.y);
    if (mag === 0) return null;
    return Math.acos(dot / mag) * (180 / Math.PI);
  }

  const leftElbowAngle = elbowAngle(LS, LE, LW);
  const rightElbowAngle = elbowAngle(RS, RE, RW);

  // -----------------------
  // LEFT JAB
  // -----------------------
  if (leftVel > MIN_SPEED && leftElbowAngle > 150) {
    return { type: "Left Jab", velocity: leftVel };
  }

  // -----------------------
  // RIGHT CROSS
  // -----------------------
  if (rightVel > MIN_SPEED && rightElbowAngle > 150) {
    return { type: "Right Cross", velocity: rightVel };
  }

  // -----------------------
  // LEFT HOOK
  // -----------------------
  if (leftVel > MIN_SPEED && leftElbowAngle > HOOK_ANGLE_MIN && leftElbowAngle < HOOK_ANGLE_MAX) {
    return { type: "Left Hook", velocity: leftVel };
  }

  // -----------------------
  // RIGHT HOOK
  // -----------------------
  if (rightVel > MIN_SPEED && rightElbowAngle > HOOK_ANGLE_MIN && rightElbowAngle < HOOK_ANGLE_MAX) {
    return { type: "Right Hook", velocity: rightVel };
  }

  // -----------------------
  // UPPERCUT — vertical force
  // -----------------------
  if (leftVel > MIN_SPEED && LW.y < LE.y - 25) {
    return { type: "Left Uppercut", velocity: leftVel };
  }

  if (rightVel > MIN_SPEED && RW.y < RE.y - 25) {
    return { type: "Right Uppercut", velocity: rightVel };
  }

  return null; // no punch detected
}
