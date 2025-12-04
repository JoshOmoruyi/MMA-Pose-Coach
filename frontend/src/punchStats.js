// punchStats.js

// GLOBAL ROUND STATE
let stats = {
  total: 0,
  jabs: 0,
  crosses: 0,
  hooks: 0,
  uppers: 0,

  comboCount: 0,
  currentCombo: [],
  lastPunchTime: 0,

  velocities: [], // stores all punch speeds for avg
};

const COMBO_TIMEOUT = 650; // ms allowed between punches to count as a combo

export function resetStats() {
  stats = {
    total: 0,
    jabs: 0,
    crosses: 0,
    hooks: 0,
    uppers: 0,

    comboCount: 0,
    currentCombo: [],
    lastPunchTime: 0,

    velocities: [],
  };
}

export function recordPunch(punchType, velocity) {
  const now = performance.now();

  stats.total++;
  stats.velocities.push(velocity);

  if (punchType === "Jab") stats.jabs++;
  if (punchType === "Cross") stats.crosses++;
  if (punchType === "Hook") stats.hooks++;
  if (punchType === "Uppercut") stats.uppers++;

  // ---- COMBO DETECTION ----
  if (now - stats.lastPunchTime < COMBO_TIMEOUT) {
    stats.currentCombo.push(punchType);
  } else {
    if (stats.currentCombo.length >= 2) stats.comboCount++;
    stats.currentCombo = [punchType];
  }

  stats.lastPunchTime = now;
}

export function getStats() {
  return {
    ...stats,
    avgVelocity:
      stats.velocities.length === 0
        ? 0
        : stats.velocities.reduce((a, b) => a + b) / stats.velocities.length,
  };
}
