/** Chart ranges shared by client and server. */
export const RANGES = {
  "1D": { barSeconds: 5 * 60, bars: 288, yahoo: { range: "1d", interval: "5m" } },
  "1W": { barSeconds: 30 * 60, bars: 336, yahoo: { range: "5d", interval: "30m" } },
  "1M": { barSeconds: 2 * 3600, bars: 360, yahoo: { range: "1mo", interval: "90m" } },
  "3M": { barSeconds: 86400, bars: 90, yahoo: { range: "3mo", interval: "1d" } },
} as const;

export type RangeKey = keyof typeof RANGES;
export const RANGE_KEYS = Object.keys(RANGES) as RangeKey[];

export function isRangeKey(r: string): r is RangeKey {
  return r in RANGES;
}
