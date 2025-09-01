// src/core/math.js
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function sign(value) {
  return value > 0 ? 1 : value < 0 ? -1 : 0;
}

export function aabbOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

export function approxEq(a, b, epsilon = 0.01) {
  return Math.abs(a - b) < epsilon;
}
