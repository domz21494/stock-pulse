"use client";

import { useQuotes } from "@/hooks/useQuotes";
import { useAlerts } from "@/lib/store";
import AlertForm from "./AlertForm";
import AlertList from "./AlertList";
import StockChart from "./StockChart";
import StockHeader from "./StockHeader";

/** Owns the single live-quote poller for the stock page and feeds header, chart and alerts. */
export default function StockDetail({ symbol, name }: { symbol: string; name?: string }) {
  const { quotes, mode } = useQuotes([symbol]);
  const quote = quotes[symbol];
  const alerts = useAlerts().filter((a) => a.symbol === symbol);

  return (
    <div className="space-y-6">
      <StockHeader symbol={symbol} name={name} quote={quote} mode={mode} />
      <StockChart symbol={symbol} quote={quote} />
      <section className="rounded-lg border border-border bg-surface p-4 space-y-4">
        <h2 className="font-semibold">Price alerts</h2>
        <AlertForm symbol={symbol} price={quote?.price} />
        {alerts.length > 0 && <AlertList alerts={alerts} quotes={quotes} />}
      </section>
    </div>
  );
}
