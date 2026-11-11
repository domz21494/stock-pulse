"use client";

import { useQuotes } from "@/hooks/useQuotes";
import ModeBadge from "./ModeBadge";
import QuoteCard from "./QuoteCard";

export default function Dashboard({ symbols }: { symbols: string[] }) {
  const { quotes, mode, error } = useQuotes(symbols);
  return (
    <div className="space-y-6">
      <section className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Market Dashboard</h1>
          <p className="text-sm text-muted">Live prices, charts, alerts and AI insights.</p>
        </div>
        <ModeBadge mode={mode} />
      </section>
      {error && <p className="text-sm text-down">Couldn&apos;t refresh prices: {error}</p>}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {symbols.map((s) => (
          <QuoteCard key={s} symbol={s} quote={quotes[s]} />
        ))}
      </section>
    </div>
  );
}
