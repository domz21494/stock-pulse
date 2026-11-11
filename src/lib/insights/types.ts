export type Tone = "up" | "down" | "neutral";
export type Sentiment = "bullish" | "bearish" | "neutral";

export interface Signal {
  label: string;
  value: string;
  tone: Tone;
  detail: string;
}

export interface Insight {
  symbol: string;
  generatedAt: number;
  /** Who wrote the headline/summary text. Numbers always come from the indicator engine. */
  author: "rules" | "ai";
  model?: string;
  sentiment: Sentiment;
  /** -100 (very bearish) … +100 (very bullish) */
  score: number;
  headline: string;
  summary: string;
  signals: Signal[];
  levels: { support: number; resistance: number } | null;
  dataSource: "live" | "demo" | "none";
}
