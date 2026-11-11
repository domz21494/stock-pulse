"use client";

import { useEffect, useRef, useState } from "react";
import type { DataSource, Quote, QuotesResponse } from "@/lib/market/types";

/** Polls /api/quotes and returns the latest quote per symbol. */
export function useQuotes(symbols: string[]) {
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [mode, setMode] = useState<DataSource | null>(null);
  const [error, setError] = useState<string | null>(null);
  const key = symbols.join(",");
  const interval = useRef(2000);

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    async function tick() {
      try {
        const res = await fetch(`/api/quotes?symbols=${key}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: QuotesResponse = await res.json();
        if (cancelled) return;
        interval.current = data.interval;
        setMode(data.mode);
        setError(null);
        setQuotes((prev) => {
          const next = { ...prev };
          for (const q of data.quotes) next[q.symbol] = q;
          return next;
        });
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) timer = setTimeout(tick, document.hidden ? 15_000 : interval.current);
      }
    }

    tick();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [key]);

  return { quotes, mode, error };
}
