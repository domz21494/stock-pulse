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

const TICK_S = 5;

export function demoPrice(symbol: string, tMs: number): number {
  const seed = hash(symbol);
  const d = tMs / 1000;
  const phase = (k: number) => rand(seed, 1000 + k) * Math.PI * 2;
  const amp = (k: number, a: number) => a * (0.6 + 0.8 * rand(seed, 2000 + k));

  const wave =
    amp(1, 0.06) * Math.sin((2 * Math.PI * d) / (6 * 86400) + phase(1)) +
    amp(2, 0.015) * Math.sin((2 * Math.PI * d) / (4 * 3600) + phase(2)) +
    amp(3, 0.005) * Math.sin((2 * Math.PI * d) / (25 * 60) + phase(3));

  // Smoothly interpolated value noise for tick-level jitter
  const k = Math.floor(d / TICK_S);
  const f = d / TICK_S - k;
  const s = f * f * (3 - 2 * f);
  const n = (rand(seed, k) - 0.5) * (1 - s) + (rand(seed, k + 1) - 0.5) * s;

  const price = basePrice(symbol) * (1 + wave + n * 0.005);
  return Math.round(price * 100) / 100;
}

export function demoQuote(symbol: string, now = Date.now()): Quote {
  const dayStart = new Date(now);
  dayStart.setUTCHours(0, 0, 0, 0);
  const open = demoPrice(symbol, dayStart.getTime());
  const prevClose = demoPrice(symbol, dayStart.getTime() - 60_000);
  const price = demoPrice(symbol, now);

  let high = Math.max(open, price);
  let low = Math.min(open, price);
  for (let t = dayStart.getTime(); t < now; t += 5 * 60_000) {
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
