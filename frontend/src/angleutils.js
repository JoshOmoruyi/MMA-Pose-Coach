// angleutils.js

// Calculate angle ABC (B is the joint)
export function calculateAngle(A, B, C) {
  if (!A || !B || !C) return null;

  const AB = { x: A.x - B.x, y: A.y - B.y };
  const CB = { x: C.x - B.x, y: C.y - B.y };

  const dot = AB.x * CB.x + AB.y * CB.y;
  const magAB = Math.hypot(AB.x, AB.y);
  const magCB = Math.hypot(CB.x, CB.y);
  if (!magAB || !magCB) return null;

  let cos = dot / (magAB * magCB);
  cos = Math.max(-1, Math.min(1, cos)); // clamp

  const angleRad = Math.acos(cos);
  return Math.round((angleRad * 180) / Math.PI);
}
