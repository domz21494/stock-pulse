"use client";

import Link from "next/link";
import { fmtPrice } from "@/lib/format";
import type { Quote } from "@/lib/market/types";
import { rearmAlert, removeAlert, type PriceAlert } from "@/lib/store";

export default function AlertList({ alerts, quotes = {} }: { alerts: PriceAlert[]; quotes?: Record<string, Quote> }) {
  if (alerts.length === 0) return <p className="text-sm text-muted">No alerts yet.</p>;

  return (
    <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
      {alerts.map((a) => {
        const q = quotes[a.symbol];
        const hit = !!a.triggeredAt;
        const distance = q ? ((a.target - q.price) / q.price) * 100 : null;
        return (
          <li key={a.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-sm">
            <Link href={`/stock/${a.symbol}`} className="font-mono font-semibold w-16 hover:text-accent">
              {a.symbol}
            </Link>
            <span className={a.condition === "above" ? "text-up" : "text-down"}>
              {a.condition === "above" ? "▲ above" : "▼ below"} <span className="font-mono">${fmtPrice(a.target)}</span>
            </span>
            <span className="text-xs text-muted flex-1 min-w-40">
              {hit
                ? `Triggered at $${fmtPrice(a.triggeredPrice!)} · ${new Date(a.triggeredAt!).toLocaleString()}`
                : q
                  ? `Now $${fmtPrice(q.price)} · ${Math.abs(distance!).toFixed(2)}% away`
                  : "Watching…"}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${hit ? "bg-amber-400/15 text-amber-400" : "bg-up/10 text-up"}`}
            >
              {hit ? "Triggered" : "Active"}
            </span>
            <div className="flex gap-2">
              {hit && (
                <button onClick={() => rearmAlert(a.id)} className="text-xs text-accent hover:underline">
                  Re-arm
                </button>
              )}
              <button onClick={() => removeAlert(a.id)} className="text-xs text-muted hover:text-down" aria-label={`Delete ${a.symbol} alert`}>
                Delete
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
