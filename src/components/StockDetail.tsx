"use client";

import { useQuotes } from "@/hooks/useQuotes";
import StockChart from "./StockChart";
import StockHeader from "./StockHeader";

/** Owns the single live-quote poller for the stock page and feeds header + chart. */
export default function StockDetail({ symbol, name }: { symbol: string; name?: string }) {
  const { quotes, mode } = useQuotes([symbol]);
  const quote = quotes[symbol];
  return (
    <div className="space-y-6">
      <StockHeader symbol={symbol} name={name} quote={quote} mode={mode} />
      <StockChart symbol={symbol} quote={quote} />
    </div>
  );
}
