"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useQuotes } from "@/hooks/useQuotes";
import { useWatchlist } from "@/lib/store";
import ModeBadge from "./ModeBadge";
import QuoteCard from "./QuoteCard";
import WatchCard from "./WatchCard";

const grid = "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3";

export default function Dashboard({ symbols }: { symbols: string[] }) {
  const watchlist = useWatchlist();
  const all = useMemo(() => [...new Set([...watchlist, ...symbols])], [watchlist, symbols]);
  const { quotes, mode, error } = useQuotes(all);

  return (
    <div className="space-y-8">
      <section className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Market Dashboard</h1>
          <p className="text-sm text-muted">Live prices, charts, alerts and AI insights.</p>
        </div>
        <ModeBadge mode={mode} />
      </section>
      {error && <p className="text-sm text-down">Couldn&apos;t refresh prices: {error}</p>}

      {watchlist.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 className="font-semibold">Your watchlist</h2>
            <Link href="/watchlist" className="text-xs text-accent">Manage →</Link>
          </div>
          <div className={grid}>
            {watchlist.map((s) => (
              <WatchCard key={s} symbol={s} quote={quotes[s]} />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="font-semibold">Popular</h2>
        <div className={grid}>
          {symbols.map((s) => (
            <QuoteCard key={s} symbol={s} quote={quotes[s]} />
          ))}
        </div>
      </section>
    </div>
  );
}
