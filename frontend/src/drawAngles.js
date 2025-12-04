// drawAngles.js

export function drawAngles(ctx, keypoints, angles) {
  ctx.save();
  ctx.font = "bold 20px Arial";
  ctx.fillStyle = "rgba(255, 255, 200, 0.95)";
  ctx.shadowColor = "rgba(255, 255, 180, 0.8)";
  ctx.shadowBlur = 10;

  const get = (name) => keypoints.find((k) => k.name === name);

  const pairs = [
    ["left_elbow", "leftElbow"],
    ["right_elbow", "rightElbow"],
    ["left_knee", "leftKnee"],
    ["right_knee", "rightKnee"],
  ];

  for (const [anchor, angleName] of pairs) {
    const a = get(anchor);
    const val = angles[angleName];

    if (a && val != null) {
      ctx.fillText(
        `${Math.round(val)}°`,
        a.x + 15,
        a.y - 10
      );
    }
  }

  ctx.restore();
}
