export type DataSource = "live" | "demo";

export interface Quote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  prevClose: number;
  /** Unix ms of the quote */
  timestamp: number;
  source: DataSource;
}

export interface SymbolInfo {
  symbol: string;
  name: string;
}

export interface QuotesResponse {
  mode: DataSource;
  /** Suggested client polling interval in ms */
  interval: number;
  quotes: Quote[];
}

export interface Candle {
  /** Unix seconds, start of the bar */
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface CandlesResponse {
  symbol: string;
  range: string;
  barSeconds: number;
  source: DataSource | "none";
  candles: Candle[];
}
