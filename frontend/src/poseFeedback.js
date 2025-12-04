export function evaluatePose(kp) {
  if (!kp) return "No pose detected";

  // Helper indexer
  const K = Object.fromEntries(kp.map(k => [k.name, k]));

  let messages = [];

  // --- Guard height ---
  if (K.left_wrist.y > K.left_shoulder.y + 40)
    messages.push("Raise your LEFT guard");

  if (K.right_wrist.y > K.right_shoulder.y + 40)
    messages.push("Raise your RIGHT guard");

  // --- Elbow tightness ---
  if (Math.abs(K.left_elbow.x - K.left_shoulder.x) > 80)
    messages.push("Keep LEFT elbow tighter");

  if (Math.abs(K.right_elbow.x - K.right_shoulder.x) > 80)
    messages.push("Keep RIGHT elbow tighter");

  // --- Stance width ---
  const stanceWidth = Math.abs(K.left_ankle.x - K.right_ankle.x);

  if (stanceWidth < 140) messages.push("Widen your stance slightly");
  if (stanceWidth > 300) messages.push("Narrow your stance a bit");

  // --- Hip rotation ---
  const hipRot = Math.abs(K.left_hip.x - K.right_hip.x);
  if (hipRot < 25) messages.push("Rotate your hips more");

  // --- Shoulder rotation ---
  const shoulderRot = Math.abs(K.left_shoulder.x - K.right_shoulder.x);
  if (shoulderRot < 20) messages.push("Square your shoulders less");

  if (messages.length === 0)
    return "Great stance! Strong posture.";

  return messages.join(" • ");
}
