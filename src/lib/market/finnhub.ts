import type { Quote, SymbolInfo } from "./types";

const BASE = "https://finnhub.io/api/v1";
const QUOTE_TTL_MS = 10_000;
const quoteCache = new Map<string, { at: number; quote: Quote }>();

async function finnhub<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "X-Finnhub-Token": process.env.FINNHUB_API_KEY ?? "" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Finnhub ${res.status} for ${path}`);
  return res.json() as Promise<T>;
}

interface FinnhubQuote {
  c: number; d: number | null; dp: number | null;
  h: number; l: number; o: number; pc: number; t: number;
}

export async function finnhubQuote(symbol: string): Promise<Quote> {
  const hit = quoteCache.get(symbol);
  if (hit && Date.now() - hit.at < QUOTE_TTL_MS) return hit.quote;

  const q = await finnhub<FinnhubQuote>(`/quote?symbol=${encodeURIComponent(symbol)}`);
  // Finnhub returns all zeros for unknown symbols
  if (!q.c && !q.pc) throw new Error(`Unknown symbol ${symbol}`);

  const quote: Quote = {
    symbol,
    price: q.c,
    change: q.d ?? q.c - q.pc,
    changePercent: q.dp ?? ((q.c - q.pc) / q.pc) * 100,
    open: q.o,
    high: q.h,
    low: q.l,
    prevClose: q.pc,
    timestamp: q.t ? q.t * 1000 : Date.now(),
    source: "live",
  };
  quoteCache.set(symbol, { at: Date.now(), quote });
  return quote;
}

interface FinnhubSearch {
  result: { symbol: string; description: string; type: string }[];
}

export async function finnhubSearch(q: string): Promise<SymbolInfo[]> {
  const data = await finnhub<FinnhubSearch>(`/search?q=${encodeURIComponent(q)}`);
  return data.result
    .filter((r) => !r.symbol.includes(".") && (r.type === "Common Stock" || r.type === "ETP"))
    .slice(0, 8)
    .map((r) => ({ symbol: r.symbol, name: r.description }));
}
