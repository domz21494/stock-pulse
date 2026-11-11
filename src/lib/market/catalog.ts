import type { SymbolInfo } from "./types";

/** Well-known tickers with rough reference prices, used for demo mode and offline search. */
export const CATALOG: (SymbolInfo & { base: number })[] = [
  { symbol: "AAPL", name: "Apple Inc.", base: 228 },
  { symbol: "MSFT", name: "Microsoft Corp.", base: 425 },
  { symbol: "NVDA", name: "NVIDIA Corp.", base: 138 },
  { symbol: "TSLA", name: "Tesla Inc.", base: 252 },
  { symbol: "AMZN", name: "Amazon.com Inc.", base: 197 },
  { symbol: "GOOGL", name: "Alphabet Inc. Class A", base: 172 },
  { symbol: "META", name: "Meta Platforms Inc.", base: 585 },
  { symbol: "NFLX", name: "Netflix Inc.", base: 765 },
  { symbol: "AMD", name: "Advanced Micro Devices", base: 152 },
  { symbol: "INTC", name: "Intel Corp.", base: 23 },
  { symbol: "AVGO", name: "Broadcom Inc.", base: 172 },
  { symbol: "ORCL", name: "Oracle Corp.", base: 178 },
  { symbol: "CRM", name: "Salesforce Inc.", base: 292 },
  { symbol: "ADBE", name: "Adobe Inc.", base: 498 },
  { symbol: "PYPL", name: "PayPal Holdings", base: 79 },
  { symbol: "UBER", name: "Uber Technologies", base: 72 },
  { symbol: "SHOP", name: "Shopify Inc.", base: 106 },
  { symbol: "PLTR", name: "Palantir Technologies", base: 58 },
  { symbol: "COIN", name: "Coinbase Global", base: 262 },
  { symbol: "DIS", name: "Walt Disney Co.", base: 112 },
  { symbol: "JPM", name: "JPMorgan Chase & Co.", base: 238 },
  { symbol: "V", name: "Visa Inc.", base: 307 },
  { symbol: "MA", name: "Mastercard Inc.", base: 515 },
  { symbol: "WMT", name: "Walmart Inc.", base: 88 },
  { symbol: "KO", name: "Coca-Cola Co.", base: 64 },
  { symbol: "PEP", name: "PepsiCo Inc.", base: 158 },
  { symbol: "MCD", name: "McDonald's Corp.", base: 292 },
  { symbol: "NKE", name: "Nike Inc.", base: 78 },
  { symbol: "BA", name: "Boeing Co.", base: 151 },
  { symbol: "XOM", name: "Exxon Mobil Corp.", base: 120 },
  { symbol: "SPY", name: "SPDR S&P 500 ETF", base: 598 },
  { symbol: "QQQ", name: "Invesco QQQ Trust", base: 512 },
];

export const FEATURED = ["AAPL", "MSFT", "NVDA", "TSLA", "AMZN", "GOOGL"];

export function searchCatalog(q: string, limit = 8): SymbolInfo[] {
  const s = q.trim().toUpperCase();
  if (!s) return [];
  return CATALOG.filter(
    (c) => c.symbol.startsWith(s) || c.name.toUpperCase().includes(s),
  )
    .sort((a, b) => Number(b.symbol.startsWith(s)) - Number(a.symbol.startsWith(s)))
    .slice(0, limit)
    .map(({ symbol, name }) => ({ symbol, name }));
}

export function isValidSymbol(s: string) {
  return /^[A-Z][A-Z0-9.\-]{0,9}$/.test(s);
}
