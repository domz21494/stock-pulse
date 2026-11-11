import { CATALOG } from "./catalog";
import type { Quote } from "./types";

/**
 * Deterministic simulated prices: price is a pure function of (symbol, time),
 * so every server instance and every request agrees, and history can be
 * generated for any range without storing state.
 */

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rand(seed: number, n: number): number {
  let x = (seed ^ Math.imul(n | 0, 2654435761)) >>> 0;
  x ^= x >>> 16;
  x = Math.imul(x, 2246822507);
  x ^= x >>> 13;
  x = Math.imul(x, 3266489909);
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}

function basePrice(symbol: string): number {
  const known = CATALOG.find((c) => c.symbol === symbol);
  if (known) return known.base;
  return 20 + (hash(symbol) % 480);
}

/** Smoothly interpolated value noise in [-0.5, 0.5] at a given time scale. */
function valueNoise(seed: number, d: number, scaleS: number): number {
  const k = Math.floor(d / scaleS);
  const f = d / scaleS - k;
  const s = f * f * (3 - 2 * f);
  return (rand(seed, k) - 0.5) * (1 - s) + (rand(seed, k + 1) - 0.5) * s;
}

/**
 * Fractal noise: irregular moves layered from multi-week trends down to
 * 5-second ticks, so charts look like a market rather than a sine wave.
 */
const OCTAVES: [scaleS: number, amplitude: number][] = [
  [21 * 86400, 0.22],
  [5 * 86400, 0.1],
  [86400, 0.045],
  [6 * 3600, 0.022],
  [3600, 0.011],
  [15 * 60, 0.005],
  [3 * 60, 0.0025],
  [5, 0.0012],
];

export function demoPrice(symbol: string, tMs: number): number {
  const seed = hash(symbol);
  const d = tMs / 1000;
  let drift = 0;
  OCTAVES.forEach(([scale, amp], i) => {
    // Offset each octave so their grid points don't line up
    drift += amp * valueNoise((seed + i * 7919) >>> 0, d + rand(seed, 500 + i) * scale, scale);
  });
  const price = basePrice(symbol) * Math.exp(drift);
  return Math.round(price * 100) / 100;
}

export function demoQuote(symbol: string, now = Date.now()): Quote {
  // Demo markets trade 24/7, so "today" is the rolling last 24 hours —
  // the same window the 1D chart and sparklines show.
  const dayStart = now - 86_400_000;
  const prevClose = demoPrice(symbol, dayStart);
  const open = demoPrice(symbol, dayStart + 60_000);
  const price = demoPrice(symbol, now);

  let high = Math.max(open, price);
  let low = Math.min(open, price);
  for (let t = dayStart; t < now; t += 60_000) {
    const p = demoPrice(symbol, t);
    if (p > high) high = p;
    if (p < low) low = p;
  }

  const change = price - prevClose;
  return {
    symbol,
    price,
    change: Math.round(change * 100) / 100,
    changePercent: Math.round((change / prevClose) * 10000) / 100,
    open,
    high,
    low,
    prevClose,
    timestamp: now,
    source: "demo",
  };
}

export function demoCandles(symbol: string, barSeconds: number, bars: number, now = Date.now()) {
  const nowS = Math.floor(now / 1000);
  const lastStart = Math.floor(nowS / barSeconds) * barSeconds;
  const samples = 12;
  const candles = [];
  for (let i = bars - 1; i >= 0; i--) {
    const start = lastStart - i * barSeconds;
    const end = Math.min(start + barSeconds, nowS);
    let high = -Infinity;
    let low = Infinity;
    const open = demoPrice(symbol, start * 1000);
    const close = demoPrice(symbol, end * 1000);
    for (let j = 0; j <= samples; j++) {
      const p = demoPrice(symbol, (start + ((end - start) * j) / samples) * 1000);
      if (p > high) high = p;
      if (p < low) low = p;
    }
    candles.push({ time: start, open, high: Math.max(high, open, close), low: Math.min(low, open, close), close });
  }
  return candles;
}
