"use client";

import { useEffect, useState } from "react";
import type { CandlesResponse } from "@/lib/market/types";

/** Tiny 1-day trend line; the last point follows the live price. */
export default function Sparkline({ symbol, price }: { symbol: string; price?: number }) {
  const [closes, setCloses] = useState<number[]>([]);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`/api/candles?symbol=${symbol}&range=1D`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d: CandlesResponse) => setCloses(d.candles.map((c) => c.close)))
      .catch(() => {});
    return () => ctrl.abort();
  }, [symbol]);

  const pts = price != null && closes.length ? [...closes.slice(0, -1), price] : closes;
  if (pts.length < 2) return <div className="h-10" />;

  const w = 120, h = 40;
  const min = Math.min(...pts), max = Math.max(...pts);
  const span = max - min || 1;
  const d = pts
    .map((p, i) => `${i ? "L" : "M"}${((i / (pts.length - 1)) * w).toFixed(1)},${(h - ((p - min) / span) * (h - 4) - 2).toFixed(1)}`)
    .join(" ");
  const up = pts[pts.length - 1] >= pts[0];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-10 w-full" aria-hidden>
      <path d={d} fill="none" strokeWidth={1.5} vectorEffect="non-scaling-stroke" stroke={up ? "var(--up)" : "var(--down)"} />
    </svg>
  );
}
