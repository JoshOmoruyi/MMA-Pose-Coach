// drawRotation.js

export function drawRotationOverlays(ctx, keypoints, shoulderRot, hipRot) {
  ctx.save();

  ctx.font = "bold 22px Arial";
  ctx.fillStyle = "rgba(180,255,255,1)";
  ctx.shadowColor = "rgba(140,255,255,0.7)";
  ctx.shadowBlur = 12;

  const L = (n) => keypoints.find((k) => k.name === n);

  const LS = L("left_shoulder");
  const RS = L("right_shoulder");
  const LH = L("left_hip");
  const RH = L("right_hip");

  if (LS && RS && shoulderRot != null) {
    const midX = (LS.x + RS.x) / 2;
    const midY = (LS.y + RS.y) / 2;
    ctx.fillText(`Shoulder Rot: ${shoulderRot.toFixed(1)}°`, midX - 60, midY - 20);
  }

  if (LH && RH && hipRot != null) {
    const midX = (LH.x + RH.x) / 2;
    const midY = (LH.y + RH.y) / 2;
    ctx.fillText(`Hip Rot: ${hipRot.toFixed(1)}°`, midX - 45, midY + 30);
  }

  ctx.restore();
}
