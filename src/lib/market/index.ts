import "server-only";
import { searchCatalog } from "./catalog";
import { demoQuote } from "./demo";
import { finnhubQuote, finnhubSearch } from "./finnhub";
import type { DataSource, Quote, SymbolInfo } from "./types";

export function dataMode(): DataSource {
  return process.env.FINNHUB_API_KEY ? "live" : "demo";
}

export function pollInterval(): number {
  // Finnhub free tier: 60 req/min, so poll live data more gently
  return dataMode() === "live" ? 10_000 : 2_000;
}

export async function getQuotes(symbols: string[]): Promise<Quote[]> {
  if (dataMode() === "demo") return symbols.map((s) => demoQuote(s));
  return Promise.all(
    symbols.map((s) =>
      finnhubQuote(s).catch((err) => {
        console.warn(`[market] live quote failed for ${s}, using demo:`, err.message);
        return demoQuote(s);
      }),
    ),
  );
}

export async function searchSymbols(q: string): Promise<SymbolInfo[]> {
  if (dataMode() === "live") {
    try {
      return await finnhubSearch(q);
    } catch (err) {
      console.warn("[market] live search failed, using catalog:", (err as Error).message);
    }
  }
  return searchCatalog(q);
}
