// angleStabilizer.js

let prev = {
  leftElbow: null,
  rightElbow: null,
  leftKnee: null,
  rightKnee: null,
};

const SMOOTH = 0.85;

export function smoothAngles(newAngles) {
  for (const key in newAngles) {
    const val = newAngles[key];
    if (val == null || Number.isNaN(val)) continue;

    if (prev[key] == null) {
      prev[key] = val;
    } else {
      prev[key] = prev[key] * SMOOTH + val * (1 - SMOOTH);
    }
  }

  return { ...prev };
}
