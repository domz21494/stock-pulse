"use client";

import type { Quote } from "@/lib/market/types";
import { toggleWatch } from "@/lib/store";
import QuoteCard from "./QuoteCard";

/** QuoteCard with a remove button (kept outside the link so it's valid HTML). */
export default function WatchCard({ symbol, quote }: { symbol: string; quote?: Quote }) {
  return (
    <div className="relative group grid">
      <QuoteCard symbol={symbol} quote={quote} />
      <button
        onClick={() => toggleWatch(symbol)}
        aria-label={`Remove ${symbol} from watchlist`}
        className="absolute -top-2 -right-2 h-6 w-6 rounded-full border border-border bg-background text-xs text-muted hover:text-down opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
      >
        ✕
      </button>
    </div>
  );
}
