"use client";

import { useQuotes } from "@/hooks/useQuotes";
import { fmtChange, fmtPct, fmtPrice } from "@/lib/format";
import ModeBadge from "./ModeBadge";
import PriceFlash from "./PriceFlash";

export default function StockHeader({ symbol, name }: { symbol: string; name?: string }) {
  const { quotes, mode } = useQuotes([symbol]);
  const q = quotes[symbol];
  const up = (q?.change ?? 0) >= 0;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold font-mono">{symbol}</h1>
          {name && <p className="text-sm text-muted">{name}</p>}
        </div>
        <ModeBadge mode={mode} />
      </div>
      {q ? (
        <>
          <div className="flex items-baseline gap-3">
            <PriceFlash price={q.price} className="text-4xl font-semibold" />
            <span className={`font-mono ${up ? "text-up" : "text-down"}`}>
              {fmtChange(q.change)} ({fmtPct(q.changePercent)})
            </span>
          </div>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            {[
              ["Open", q.open],
              ["High", q.high],
              ["Low", q.low],
              ["Prev close", q.prevClose],
            ].map(([label, v]) => (
              <div key={label} className="rounded-lg border border-border bg-surface p-3">
                <dt className="text-muted text-xs">{label}</dt>
                <dd className="font-mono tabular-nums">{fmtPrice(v as number)}</dd>
              </div>
            ))}
          </dl>
        </>
      ) : (
        <div className="h-10 w-48 rounded bg-border animate-pulse" />
      )}
    </section>
  );
}
