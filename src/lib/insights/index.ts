import "server-only";
import { getCandles, getQuotes } from "@/lib/market";
import { analyze } from "./engine";
import { aiEnabled, geminiModel, geminiNarrative } from "./gemini";
import type { Insight } from "./types";

const TTL_MS = 5 * 60_000;
const cache = new Map<string, { at: number; insight: Insight }>();

export async function getInsight(symbol: string, fresh = false): Promise<Insight> {
  const hit = cache.get(symbol);
  // Even on "refresh", reuse AI text for 60s to protect the free-tier quota
  const maxAge = fresh ? 60_000 : TTL_MS;
  if (hit && Date.now() - hit.at < maxAge) return hit.insight;

  const [[quote], candles] = await Promise.all([getQuotes([symbol]), getCandles(symbol, "3M")]);
  const { insight, facts } = analyze(symbol, quote, candles.candles, candles.source);

  if (aiEnabled()) {
    try {
      const ai = await geminiNarrative(facts);
      Object.assign(insight, ai, { author: "ai", model: geminiModel() });
    } catch (err) {
      console.warn(`[insights] AI narrative failed for ${symbol}, using built-in:`, (err as Error).message);
    }
  }

  cache.set(symbol, { at: Date.now(), insight });
  return insight;
}
