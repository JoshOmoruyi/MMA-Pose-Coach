// PoseDetector.js
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import * as poseDetection from "@tensorflow-models/pose-detection";

let detector = null;

async function initTF() {
  await tf.setBackend("webgl");
  await tf.ready();
  console.log("[TF] Backend:", tf.getBackend());
}

export const loadPoseModel = async () => {
  await initTF();

  try {
    detector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      { modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER }
    );
    console.log("[PoseDetector] Model loaded:", detector);
    return detector;
  } catch (err) {
    console.error("[PoseDetector] Model load failed:", err);
    return null;
  }
};

// ------------ STRONG MULTI-FRAME SMOOTHING ------------
let prevKeypoints = null;
const SMOOTH = 0.75;

function smoothKeypoints(kp) {
  if (!prevKeypoints) {
    prevKeypoints = kp.map(p => ({ ...p }));
    return kp;
  }

  const smoothed = kp.map((p, i) => {
    const prev = prevKeypoints[i];
    return {
      ...p,
      x: prev.x * SMOOTH + p.x * (1 - SMOOTH),
      y: prev.y * SMOOTH + p.y * (1 - SMOOTH),
      score: p.score
    };
  });

  prevKeypoints = smoothed.map(p => ({ ...p }));
  return smoothed;
}

export const runPoseDetection = (video, callback) => {
  if (!detector) return;

  const detect = async () => {
    try {
      const poses = await detector.estimatePoses(video);
      if (poses?.[0]?.keypoints) {
        const smoothed = smoothKeypoints(poses[0].keypoints);
        callback(smoothed);
      }
    } catch (err) {
      console.error("[PoseDetector] Detection error:", err);
    }

    requestAnimationFrame(detect);
  };

  detect();
};
