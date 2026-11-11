import type { Candle } from "./types";

/** Historical bars from Yahoo Finance's public chart endpoint (no key required). */
const cache = new Map<string, { at: number; candles: Candle[] }>();
const TTL_MS = 60_000;

interface YahooChart {
  chart: {
    result?: {
      timestamp?: number[];
      indicators: { quote: { open: (number | null)[]; high: (number | null)[]; low: (number | null)[]; close: (number | null)[] }[] };
    }[];
    error?: { description: string } | null;
  };
}

export async function yahooCandles(symbol: string, range: string, interval: string): Promise<Candle[]> {
  const key = `${symbol}:${range}:${interval}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.candles;

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; StockPulse/1.0)" },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Yahoo ${res.status}`);
  const data: YahooChart = await res.json();
  const r = data.chart.result?.[0];
  if (!r?.timestamp) throw new Error(data.chart.error?.description ?? "No chart data");

  const q = r.indicators.quote[0];
  const candles: Candle[] = [];
  r.timestamp.forEach((t, i) => {
    const [o, h, l, c] = [q.open[i], q.high[i], q.low[i], q.close[i]];
    if (o == null || h == null || l == null || c == null) return;
    candles.push({ time: t, open: o, high: h, low: l, close: c });
  });
  cache.set(key, { at: Date.now(), candles });
  return candles;
}
