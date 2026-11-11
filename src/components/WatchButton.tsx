"use client";

import { toggleWatch, useWatchlist } from "@/lib/store";

export default function WatchButton({ symbol }: { symbol: string }) {
  const watching = useWatchlist().includes(symbol);
  return (
    <button
      onClick={() => toggleWatch(symbol)}
      aria-pressed={watching}
      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
        watching ? "border-amber-400/60 text-amber-400" : "border-border text-muted hover:text-foreground"
      }`}
    >
      {watching ? "★ Watching" : "☆ Watch"}
    </button>
  );
}
