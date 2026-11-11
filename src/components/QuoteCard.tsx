import Link from "next/link";
import type { Quote } from "@/lib/market/types";
import { fmtPct } from "@/lib/format";
import PriceFlash from "./PriceFlash";

export default function QuoteCard({ symbol, quote }: { symbol: string; quote?: Quote }) {
  const up = (quote?.change ?? 0) >= 0;
  return (
    <Link
      href={`/stock/${symbol}`}
      className="rounded-lg border border-border bg-surface p-4 hover:border-accent/60 transition-colors"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm font-semibold">{symbol}</span>
        {quote && (
          <span className={`text-xs font-mono ${up ? "text-up" : "text-down"}`}>
            {fmtPct(quote.changePercent)}
          </span>
        )}
      </div>
      <div className="mt-2 text-xl">
        {quote ? <PriceFlash price={quote.price} /> : <div className="h-7 w-24 rounded bg-border animate-pulse" />}
      </div>
    </Link>
  );
}
