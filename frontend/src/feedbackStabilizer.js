// src/feedbackStabilizer.js

let lastFeedback = "";

// Rename to match PoseCamera import
export function smoothFeedback(newMessage) {
  if (!newMessage || typeof newMessage !== "string") {
    return lastFeedback;
  }

  if (lastFeedback && similarity(lastFeedback, newMessage) > 0.75) {
    return lastFeedback;
  }

  lastFeedback = newMessage;
  return lastFeedback;
}

function similarity(a, b) {
  if (!a || !b) return 0;

  const wordsA = a.split(" ");
  const wordsB = b.split(" ");

  let matches = 0;
  for (let w of wordsA) {
    if (wordsB.includes(w)) matches++;
  }

  return matches / Math.max(wordsA.length, wordsB.length);
}
