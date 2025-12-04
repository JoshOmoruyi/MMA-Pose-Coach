// PoseCamera.jsx
import { useEffect, useRef } from "react";
import { loadPoseModel, runPoseDetection } from "./PoseDetector";
import { analyzePose } from "./poseAnalysis";
import { drawAngles } from "./drawAngles";
import { drawRotationOverlays } from "./drawRotation";
import { computeWristVelocity } from "./punchTracker";
import { classifyPunch } from "./punchClassifier";

// Skeleton connections (neon UFC-style)
const SKELETON = [
  ["left_shoulder", "right_shoulder"],
  ["left_shoulder", "left_elbow"],
  ["left_elbow", "left_wrist"],
  ["right_shoulder", "right_elbow"],
  ["right_elbow", "right_wrist"],
  ["left_hip", "right_hip"],
  ["left_shoulder", "left_hip"],
  ["right_shoulder", "right_hip"],
  ["left_hip", "left_knee"],
  ["left_knee", "left_ankle"],
  ["right_hip", "right_knee"],
  ["right_knee", "right_ankle"],
];

const KEYPOINT_NAMES = [
  "nose",
  "left_eye",
  "right_eye",
  "left_ear",
  "right_ear",
  "left_shoulder",
  "right_shoulder",
  "left_elbow",
  "right_elbow",
  "left_wrist",
  "right_wrist",
  "left_hip",
  "right_hip",
  "left_knee",
  "right_knee",
  "left_ankle",
  "right_ankle",
];

// ---------- DRAW HELPERS ----------

function drawSkeleton(ctx, keypoints) {
  ctx.save();
  ctx.lineWidth = 6;
  ctx.strokeStyle = "rgba(180, 255, 255, 0.85)";
  ctx.shadowColor = "rgba(150, 255, 255, 0.7)";
  ctx.shadowBlur = 12;

  SKELETON.forEach(([a, b]) => {
    const A = keypoints.find((k) => k.name === a);
    const B = keypoints.find((k) => k.name === b);
    if (A?.score > 0.5 && B?.score > 0.5) {
      ctx.beginPath();
      ctx.moveTo(A.x, A.y);
      ctx.lineTo(B.x, B.y);
      ctx.stroke();
    }
  });

  ctx.restore();
}

function drawJoints(ctx, keypoints) {
  ctx.save();

  keypoints.forEach((k) => {
    if (k.score > 0.5) {
      ctx.beginPath();
      ctx.arc(k.x, k.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 180, 180, 0.95)";
      ctx.shadowColor = "rgba(255, 120, 120, 1)";
      ctx.shadowBlur = 15;
      ctx.fill();
    }
  });

  ctx.restore();
}

// ---------- SHADOWBOXING VISUALS ----------

function getTargetPads(width, height) {
  const cx = width * 0.78;
  return [
    { name: "Head", cx, cy: height * 0.25, r: 55, color: "rgba(255, 80, 80, 0.4)" },
    { name: "Body", cx, cy: height * 0.50, r: 60, color: "rgba(80, 200, 255, 0.35)" },
    { name: "Leg",  cx, cy: height * 0.75, r: 65, color: "rgba(140, 255, 140, 0.35)" },
  ];
}

function drawTargetPads(ctx, pads) {
  ctx.save();
  pads.forEach((pad) => {
    ctx.beginPath();
    ctx.arc(pad.cx, pad.cy, pad.r, 0, Math.PI * 2);
    ctx.fillStyle = pad.color;
    ctx.fill();

    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.stroke();

    ctx.font = "bold 16px Arial";
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillText(pad.name, pad.cx - 25, pad.cy + 4);
  });
  ctx.restore();
}

function drawPunchTrails(ctx, trails) {
  ctx.save();

  const drawTrail = (points, rgb) => {
    if (points.length < 2) return;
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      const t = i / points.length; // newer = closer to 1

      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.strokeStyle = `rgba(${rgb}, ${0.2 + 0.6 * t})`;
      ctx.lineWidth = 4 * t;
      ctx.stroke();
    }
  };

  drawTrail(trails.left, "255, 220, 180");   // warm orange
  drawTrail(trails.right, "180, 220, 255");  // cool blue

  ctx.restore();
}

function drawSparks(ctx, sparks) {
  ctx.save();

  sparks.forEach((s) => {
    const alpha = s.life;
    const radius = s.baseRadius * (1 + (1 - s.life));

    ctx.beginPath();
    ctx.arc(s.x, s.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 230, 150, ${alpha})`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(s.x, s.y, radius * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fill();
  });

  ctx.restore();
}

function distanceToPad(wrist, pad) {
  const dx = wrist.x - pad.cx;
  const dy = wrist.y - pad.cy;
  return Math.hypot(dx, dy);
}

export default function PoseCamera({ videoRef, mode, setFeedback, setScores }) {
  const canvasRef = useRef(null);

  const trailsRef = useRef({ left: [], right: [] });
  const lastWristRef = useRef({ left: null, right: null });
  const sparksRef = useRef([]);
  const lastHitTimeRef = useRef(0);

  useEffect(() => {
    const start = async () => {
      const model = await loadPoseModel();
      if (!model) {
        setFeedback("Model failed to load");
        return;
      }

      runPoseDetection(videoRef.current, (keypoints) => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;
        if (video.videoWidth === 0) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Name fallback
        keypoints.forEach((kp, i) => {
          if (!kp.name && KEYPOINT_NAMES[i]) {
            kp.name = KEYPOINT_NAMES[i];
          }
        });

        // ---- Base analysis (angles, rotation, etc.) ----
        const analysis = analyzePose(keypoints, mode);
        const {
          messages,
          angles,
          shoulderRotation,
          hipRotation,
        } = analysis;

        // ---- Punch velocity + classification ----
        const { leftVel, rightVel } = computeWristVelocity(keypoints);
        const punch = classifyPunch(keypoints, leftVel, rightVel);

        // ---- Shadowboxing visuals & scoring ----
        let pads = [];
        if (mode === "shadowboxing") {
          pads = [];

          const leftWrist = keypoints.find(k => k.name === "left_wrist");
          const rightWrist = keypoints.find(k => k.name === "right_wrist");
          const now = performance.now();

          const updateWrist = (sideName, wrist) => {
            if (!wrist || wrist.score < 0.5) return { speed: 0 };

            const last = lastWristRef.current[sideName];
            let speed = 0;

            if (last) {
              const dx = wrist.x - last.x;
              const dy = wrist.y - last.y;
              speed = Math.hypot(dx, dy);
            }

            lastWristRef.current[sideName] = { x: wrist.x, y: wrist.y };

            const trailArr = trailsRef.current[sideName];
            trailArr.push({ x: wrist.x, y: wrist.y });
            if (trailArr.length > 14) trailArr.shift();

            const SPEED_HARD = 22;
            if (speed > SPEED_HARD && pads.length > 0) {
              const hitPad = pads.find(pad => distanceToPad(wrist, pad) < pad.r);
              if (hitPad && now - lastHitTimeRef.current > 250) {
                lastHitTimeRef.current = now;

                sparksRef.current.push({
                  x: wrist.x,
                  y: wrist.y,
                  life: 1.0,
                  baseRadius: 20,
                });

                setScores(prev => ({
                  ...prev,
                  overall: Math.min(100, prev.overall + 2),
                }));
              }
            }

            return { speed };
          };

          updateWrist("left", leftWrist);
          updateWrist("right", rightWrist);

          // fade sparks
          sparksRef.current = sparksRef.current
            .map(s => ({ ...s, life: s.life - 0.07 }))
            .filter(s => s.life > 0);
        } else {
          // In coach mode, clear trails/sparks
          trailsRef.current.left = [];
          trailsRef.current.right = [];
          sparksRef.current = [];
        }

        // ---- Feedback text (separated by mode) ----
        if (mode === "shadowboxing") {
          if (punch) {
            setFeedback(`🔥 ${punch.type}! Speed: ${punch.velocity.toFixed(1)}`);
          } else if (messages && messages.length > 0) {
            // fallback when not punching
            setFeedback(messages.join(" • "));
          }
        } else {
          // Coach mode
          if (messages && messages.length > 0) {
            setFeedback(messages.join(" • "));
          }
        }

        // ---- DRAW OVERLAYS ----

        if (mode === "coach") {
          drawSkeleton(ctx, keypoints);
          drawJoints(ctx, keypoints);
          drawAngles(ctx, keypoints, angles);
          drawRotationOverlays(ctx, keypoints, shoulderRotation, hipRotation);
        }

        if (mode === "shadowboxing") {
        
          drawPunchTrails(ctx, trailsRef.current);
          drawSparks(ctx, sparksRef.current);
        }
      });
    };

    start();
  }, [videoRef, mode, setFeedback, setScores]);

  return (
    <div className="relative w-full flex flex-col items-center">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="rounded-xl w-full border border-gray-700 shadow-lg"
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 pointer-events-none"
      />
    </div>
  );
}
