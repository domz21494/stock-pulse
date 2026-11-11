import type { DataSource } from "@/lib/market/types";

export default function ModeBadge({ mode }: { mode: DataSource | null }) {
  if (!mode) return null;
  const live = mode === "live";
  return (
    <span
      title={live ? "Real market data from Finnhub" : "Simulated prices — add FINNHUB_API_KEY for real data"}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs ${
        live ? "border-up/40 text-up" : "border-amber-500/40 text-amber-400"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${live ? "bg-up" : "bg-amber-400"}`} />
      {live ? "Live data" : "Demo data"}
    </span>
  );
}
