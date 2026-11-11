"use client";

import Link from "next/link";
import { useQuotes } from "@/hooks/useQuotes";
import { FEATURED } from "@/lib/market/catalog";
import { toggleWatch, useWatchlist } from "@/lib/store";
import ModeBadge from "./ModeBadge";
import WatchCard from "./WatchCard";

export default function WatchlistView() {
  const watchlist = useWatchlist();
  const { quotes, mode } = useQuotes(watchlist);
  const suggestions = FEATURED.filter((s) => !watchlist.includes(s));

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Watchlist</h1>
          <p className="text-sm text-muted">Saved in this browser.</p>
        </div>
        {watchlist.length > 0 && <ModeBadge mode={mode} />}
      </div>

      {watchlist.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center space-y-2">
          <p>Your watchlist is empty.</p>
          <p className="text-sm text-muted">Search for a stock and press ☆ Watch, or add one below.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {watchlist.map((s) => (
            <WatchCard key={s} symbol={s} quote={quotes[s]} />
          ))}
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted">Quick add</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => toggleWatch(s)}
                className="rounded-full border border-border px-3 py-1 text-xs font-mono hover:border-accent"
              >
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}
      <p className="text-xs text-muted">
        Tip: hover a card and press ✕ to remove it. <Link href="/alerts" className="text-accent">Set price alerts →</Link>
      </p>
    </div>
  );
}
