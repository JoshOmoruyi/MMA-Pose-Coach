// src/shadowboxingEngine.js

let prevKeypoints = null;
let prevTime = null;
let lastPunchTime = 0;
let punchCount = 0;

function getByName(kpList, name) {
  return kpList?.find((k) => k.name === name) || null;
}

function computeSpeed(curr, prev, dt) {
  if (!curr || !prev || !dt || dt <= 0) return 0;
  const dx = curr.x - prev.x;
  const dy = curr.y - prev.y;
  const dist = Math.hypot(dx, dy); // pixels
  return dist / dt; // pixels per second (approx)
}

// angles: from your poseAnalysis (leftElbow, rightElbow)
export function processShadowboxingFrame(keypoints, angles) {
  const now = performance.now();
  const dt = prevTime ? (now - prevTime) / 1000 : 0;

  // First frame: just store and bail
  if (!prevKeypoints || !dt) {
    prevKeypoints = keypoints.map((k) => ({ ...k }));
    prevTime = now;
    return {
      punchType: null,
      punchCount,
      intensity: 0,
      messages: [],
    };
  }

  const LW = getByName(keypoints, "left_wrist");
  const RW = getByName(keypoints, "right_wrist");
  const prevLW = getByName(prevKeypoints, "left_wrist");
  const prevRW = getByName(prevKeypoints, "right_wrist");

  const leftSpeed = computeSpeed(LW, prevLW, dt);
  const rightSpeed = computeSpeed(RW, prevRW, dt);

  prevKeypoints = keypoints.map((k) => ({ ...k }));
  prevTime = now;

  const nowMs = now;
  const COOLDOWN = 260; // ms between punch detections

  let punchType = null;
  let intensity = 0;
  const punchMessages = [];

  const leftAngle = angles?.leftElbow ?? null;
  const rightAngle = angles?.rightElbow ?? null;

  // thresholds tuned for smoothed MoveNet keypoints
  const SPEED_THRESHOLD = 350; // "this likely was a punch"
  const BIG_SPEED = 550;       // "fast punch"

  if (nowMs - lastPunchTime > COOLDOWN) {
    // LEFT ARM
    if (leftSpeed > SPEED_THRESHOLD && leftSpeed > rightSpeed * 0.8) {
      intensity = Math.max(
        0,
        Math.min(
          100,
          ((leftSpeed - SPEED_THRESHOLD) / (BIG_SPEED - SPEED_THRESHOLD)) * 100
        )
      );

      if (leftAngle != null && leftAngle > 150) {
        punchType = "Left straight";
      } else if (leftAngle != null && leftAngle > 80 && leftAngle < 140) {
        punchType = "Left hook";
      } else {
        punchType = "Left strike";
      }
    }

    // RIGHT ARM
    else if (rightSpeed > SPEED_THRESHOLD && rightSpeed > leftSpeed * 0.8) {
      intensity = Math.max(
        0,
        Math.min(
          100,
          ((rightSpeed - SPEED_THRESHOLD) / (BIG_SPEED - SPEED_THRESHOLD)) * 100
        )
      );

      if (rightAngle != null && rightAngle > 150) {
        punchType = "Right straight";
      } else if (rightAngle != null && rightAngle > 80 && rightAngle < 140) {
        punchType = "Right hook";
      } else {
        punchType = "Right strike";
      }
    }

    if (punchType) {
      lastPunchTime = nowMs;
      punchCount += 1;

      punchMessages.push(`Punch #${punchCount}: ${punchType}`);

      if (intensity > 70) {
        punchMessages.push("Nice snap on that shot.");
      } else if (intensity > 40) {
        punchMessages.push("Good speed — extend fully and stay sharp.");
      } else {
        punchMessages.push("Turn your hips and accelerate the fist more.");
      }
    }
  }

  return {
    punchType,
    punchCount,
    intensity,
    messages: punchMessages,
  };
}
