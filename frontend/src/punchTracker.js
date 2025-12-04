// src/punchTracker.js
let prevLeft = null;
let prevRight = null;
let prevTime = null;

export function computeWristVelocity(keypoints) {
  const LW = keypoints.find(k => k.name === "left_wrist");
  const RW = keypoints.find(k => k.name === "right_wrist");

  const now = performance.now();
  if (prevTime == null) {
    prevLeft = LW;
    prevRight = RW;
    prevTime = now;
    return { leftVel: 0, rightVel: 0 };
  }

  const dt = (now - prevTime) / 1000; // seconds

  const leftVel = (LW && prevLeft)
    ? Math.hypot(LW.x - prevLeft.x, LW.y - prevLeft.y) / dt
    : 0;

  const rightVel = (RW && prevRight)
    ? Math.hypot(RW.x - prevRight.x, RW.y - prevRight.y) / dt
    : 0;

  prevLeft = LW;
  prevRight = RW;
  prevTime = now;

  return { leftVel, rightVel };
}
