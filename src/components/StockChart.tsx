"use client";

import { useEffect, useRef, useState } from "react";
import {
  AreaSeries,
  CandlestickSeries,
  ColorType,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import { RANGE_KEYS, type RangeKey } from "@/lib/market/ranges";
import type { Candle, CandlesResponse, Quote } from "@/lib/market/types";

type ChartType = "candles" | "line";

const COLORS = { up: "#16c784", down: "#ea3943", text: "#8a93a6", grid: "#1a2030", border: "#1f2635" };

/** lightweight-charts renders timestamps as UTC; shift them so the axis shows local time. */
const toLocal = (t: number) => (t - new Date(t * 1000).getTimezoneOffset() * 60) as UTCTimestamp;

function toPoint(c: Candle, type: ChartType) {
  const time = toLocal(c.time);
  return type === "candles"
    ? { time, open: c.open, high: c.high, low: c.low, close: c.close }
    : { time, value: c.close };
}

export default function StockChart({ symbol, quote }: { symbol: string; quote?: Quote }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | ISeriesApi<"Area"> | null>(null);
  const candlesRef = useRef<Candle[]>([]);
  const barRef = useRef(300);

  const [range, setRange] = useState<RangeKey>("1D");
  const [type, setType] = useState<ChartType>("candles");
  const key = `${symbol}:${range}`;
  const [loaded, setLoaded] = useState<{ key: string; status: "ready" | "no-history" | "error" } | null>(null);
  const status = loaded?.key === key ? loaded.status : "loading";

  // Create the chart once
  useEffect(() => {
    const chart = createChart(containerRef.current!, {
      autoSize: true,
      layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: COLORS.text, fontFamily: "var(--font-geist-mono)" },
      grid: { vertLines: { color: COLORS.grid }, horzLines: { color: COLORS.grid } },
      rightPriceScale: { borderColor: COLORS.border },
      timeScale: { borderColor: COLORS.border, timeVisible: true, secondsVisible: false },
      crosshair: { mode: 0 },
    });
    chartRef.current = chart;
    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  // (Re)build the series when chart type changes
  useEffect(() => {
    const chart = chartRef.current!;
    if (seriesRef.current) chart.removeSeries(seriesRef.current);
    seriesRef.current =
      type === "candles"
        ? chart.addSeries(CandlestickSeries, {
            upColor: COLORS.up, downColor: COLORS.down, borderVisible: false,
            wickUpColor: COLORS.up, wickDownColor: COLORS.down,
          })
        : chart.addSeries(AreaSeries, { lineWidth: 2 });
    paint();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  function paint() {
    const series = seriesRef.current;
    const candles = candlesRef.current;
    if (!series) return;
    if (type === "line" && candles.length) {
      const up = candles[candles.length - 1].close >= candles[0].open;
      const c = up ? COLORS.up : COLORS.down;
      (series as ISeriesApi<"Area">).applyOptions({ lineColor: c, topColor: `${c}55`, bottomColor: `${c}00` });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    series.setData(candles.map((c) => toPoint(c, type)) as any);
    chartRef.current?.timeScale().fitContent();
  }

  // Load history when symbol or range changes
  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`/api/candles?symbol=${symbol}&range=${range}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data: CandlesResponse) => {
        candlesRef.current = data.candles;
        barRef.current = data.barSeconds;
        setLoaded({ key, status: data.candles.length ? "ready" : "no-history" });
        paint();
      })
      .catch((e) => e.name !== "AbortError" && setLoaded({ key, status: "error" }));
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Stream live ticks into the latest bar
  useEffect(() => {
    if (!quote || !seriesRef.current || status === "loading") return;
    const candles = candlesRef.current;
    const bar = barRef.current;
    const t = Math.floor(quote.timestamp / 1000 / bar) * bar;
    const last = candles[candles.length - 1];
    const p = quote.price;

    let current: Candle;
    if (last && t === last.time) {
      current = { ...last, high: Math.max(last.high, p), low: Math.min(last.low, p), close: p };
      candles[candles.length - 1] = current;
    } else if (!last || t > last.time) {
      const open = last?.close ?? p;
      current = { time: t, open, high: Math.max(open, p), low: Math.min(open, p), close: p };
      candles.push(current);
    } else {
      return; // stale tick (e.g. market closed)
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    seriesRef.current.update(toPoint(current, type) as any);
  }, [quote, type, status]);

  const btn = (active: boolean) =>
    `px-2.5 py-1 rounded text-xs font-mono transition-colors ${active ? "bg-accent text-white" : "text-muted hover:text-foreground"}`;

  return (
    <section className="rounded-lg border border-border bg-surface p-3">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex gap-1" role="group" aria-label="Range">
          {RANGE_KEYS.map((r) => (
            <button key={r} className={btn(r === range)} onClick={() => setRange(r)} aria-pressed={r === range}>
              {r}
            </button>
          ))}
        </div>
        <div className="flex gap-1" role="group" aria-label="Chart type">
          {(["candles", "line"] as const).map((t) => (
            <button key={t} className={btn(t === type)} onClick={() => setType(t)} aria-pressed={t === type}>
              {t === "candles" ? "Candles" : "Line"}
            </button>
          ))}
        </div>
      </div>
      <div className="relative h-[420px]">
        <div ref={containerRef} className="absolute inset-0" />
        {status !== "ready" && (
          <div className="absolute inset-0 grid place-items-center text-sm text-muted pointer-events-none">
            {status === "loading" && "Loading chart…"}
            {status === "error" && "Couldn't load chart data."}
            {status === "no-history" && "History unavailable — charting live ticks as they arrive."}
          </div>
        )}
      </div>
    </section>
  );
}
