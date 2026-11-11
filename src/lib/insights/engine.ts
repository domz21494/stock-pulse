import type { Candle, Quote } from "@/lib/market/types";
import { macd, pctChange, rsi, sma, volatility } from "./indicators";
import type { Insight, Sentiment, Signal, Tone } from "./types";

const $ = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const pct = (n: number, signed = true) => `${signed && n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/** Facts the AI may phrase — every number here is computed, never generated. */
export interface InsightFacts {
  symbol: string;
  price: number;
  dayChangePct: number;
  monthChangePct: number | null;
  sma20: number | null;
  sma50: number | null;
  rsi14: number | null;
  macdHist: number | null;
  macdCross: "bullish" | "bearish" | null;
  volatilityPct: number | null;
  support: number | null;
  resistance: number | null;
  score: number;
  sentiment: Sentiment;
}

/**
 * Rule-based technical analysis over daily candles.
 * Produces a score, signal cards, and a plain-English summary.
 */
export function analyze(
  symbol: string,
  quote: Quote,
  daily: Candle[],
  dataSource: Insight["dataSource"],
): { insight: Insight; facts: InsightFacts } {
  const closes = daily.map((c) => c.close);
  // Make the latest bar reflect the live price
  if (closes.length) closes[closes.length - 1] = quote.price;
  const price = quote.price;

  const s20 = sma(closes, 20);
  const s50 = sma(closes, 50);
  const r = rsi(closes, 14);
  const m = macd(closes);
  const vol = volatility(closes, 20);
  const monthAgo = closes.length > 21 ? closes[closes.length - 22] : null;
  const monthChange = monthAgo ? pctChange(monthAgo, price) : null;
  const recent = daily.slice(-20);
  const support = recent.length ? Math.min(...recent.map((c) => c.low), price) : null;
  const resistance = recent.length ? Math.max(...recent.map((c) => c.high), price) : null;

  const signals: Signal[] = [];
  let score = 0;

  // Trend
  if (s20 != null && s50 != null) {
    const above20 = price > s20, above50 = price > s50;
    score += above20 ? 15 : -15;
    score += above50 ? 15 : -15;
    score += s20 > s50 ? 10 : -10;
    const tone: Tone = above20 && above50 ? "up" : !above20 && !above50 ? "down" : "neutral";
    signals.push({
      label: "Trend",
      value: tone === "up" ? "Uptrend" : tone === "down" ? "Downtrend" : "Mixed",
      tone,
      detail: `Price ${above20 ? "above" : "below"} 20-day avg (${$(s20)}) and ${above50 ? "above" : "below"} 50-day avg (${$(s50)}).`,
    });
  } else if (s20 != null) {
    score += price > s20 ? 15 : -15;
    signals.push({
      label: "Trend",
      value: price > s20 ? "Above avg" : "Below avg",
      tone: price > s20 ? "up" : "down",
      detail: `Price is ${price > s20 ? "above" : "below"} its 20-day average (${$(s20)}).`,
    });
  }

  // Momentum: RSI
  if (r != null) {
    let tone: Tone = "neutral", value = "Neutral";
    if (r >= 70) { score -= 10; tone = "down"; value = "Overbought"; }
    else if (r <= 30) { score += 10; tone = "up"; value = "Oversold"; }
    else if (r >= 55) { score += 7; tone = "up"; value = "Strong"; }
    else if (r <= 45) { score -= 7; tone = "down"; value = "Weak"; }
    signals.push({
      label: "RSI (14)",
      value: `${r.toFixed(0)} · ${value}`,
      tone,
      detail:
        r >= 70 ? "Momentum is stretched; pullbacks are common from here."
        : r <= 30 ? "Selling looks exhausted; bounces are common from here."
        : `Momentum is ${value.toLowerCase()}, with room to move either way.`,
    });
  }

  // MACD
  let macdCross: InsightFacts["macdCross"] = null;
  if (m) {
    score += m.hist > 0 ? 10 : -10;
    if (m.hist > 0 && m.prevHist <= 0) macdCross = "bullish";
    if (m.hist < 0 && m.prevHist >= 0) macdCross = "bearish";
    signals.push({
      label: "MACD",
      value: macdCross ? `${macdCross === "bullish" ? "Bullish" : "Bearish"} cross` : m.hist > 0 ? "Positive" : "Negative",
      tone: m.hist > 0 ? "up" : "down",
      detail: macdCross
        ? `MACD just crossed ${macdCross === "bullish" ? "above" : "below"} its signal line.`
        : `MACD is ${m.hist > 0 ? "above" : "below"} its signal line, ${Math.abs(m.hist) > Math.abs(m.prevHist) ? "and the gap is widening" : "but the gap is narrowing"}.`,
    });
  }

  // Performance
  if (monthChange != null) {
    score += clamp(monthChange * 2, -20, 20);
    signals.push({
      label: "1-month",
      value: pct(monthChange),
      tone: monthChange > 1 ? "up" : monthChange < -1 ? "down" : "neutral",
      detail: `Today ${pct(quote.changePercent)}; over ~21 trading days ${pct(monthChange)}.`,
    });
  }
  score += clamp(quote.changePercent * 2, -5, 5);

  // Volatility
  if (vol != null) {
    const level = vol < 25 ? "Low" : vol < 45 ? "Moderate" : "High";
    signals.push({
      label: "Volatility",
      value: `${vol.toFixed(0)}% · ${level}`,
      tone: "neutral",
      detail: `Annualized from the last 20 daily moves. ${level === "High" ? "Expect large swings." : level === "Low" ? "Price has been calm." : "Typical for a large-cap stock."}`,
    });
  }

  score = Math.round(clamp(score, -100, 100));
  const sentiment: Sentiment = score >= 20 ? "bullish" : score <= -20 ? "bearish" : "neutral";

  const facts: InsightFacts = {
    symbol, price, dayChangePct: quote.changePercent, monthChangePct: monthChange,
    sma20: s20, sma50: s50, rsi14: r, macdHist: m?.hist ?? null, macdCross,
    volatilityPct: vol, support, resistance, score, sentiment,
  };

  return {
    facts,
    insight: {
      symbol,
      generatedAt: Date.now(),
      author: "rules",
      sentiment,
      score,
      headline: headline(facts),
      summary: summary(facts),
      signals,
      levels: support != null && resistance != null ? { support, resistance } : null,
      dataSource,
    },
  };
}

function headline(f: InsightFacts): string {
  if (f.sma20 == null && f.rsi14 == null) {
    return `${f.symbol} ${f.dayChangePct >= 0 ? "up" : "down"} ${Math.abs(f.dayChangePct).toFixed(2)}% today — not enough history for a full read`;
  }
  const trendUp = f.sma20 != null && f.sma50 != null && f.price > f.sma20 && f.price > f.sma50;
  const trendDown = f.sma20 != null && f.sma50 != null && f.price < f.sma20 && f.price < f.sma50;
  if (f.rsi14 != null && f.rsi14 >= 70) return `${f.symbol} is running hot — momentum looks stretched`;
  if (f.rsi14 != null && f.rsi14 <= 30) return `${f.symbol} looks oversold after a sharp decline`;
  if (f.macdCross === "bullish") return `${f.symbol} flashes a fresh bullish momentum signal`;
  if (f.macdCross === "bearish") return `${f.symbol} momentum is rolling over`;
  if (trendUp && f.sentiment === "bullish") return `${f.symbol} holds a healthy uptrend`;
  if (trendDown && f.sentiment === "bearish") return `${f.symbol} remains under pressure in a downtrend`;
  if (f.sentiment === "bullish") return `${f.symbol} leans bullish with improving technicals`;
  if (f.sentiment === "bearish") return `${f.symbol} leans bearish as technicals weaken`;
  return `${f.symbol} is range-bound with mixed signals`;
}

function summary(f: InsightFacts): string {
  const parts: string[] = [];
  const dir = f.dayChangePct >= 0 ? "up" : "down";
  parts.push(
    `${f.symbol} is trading at ${$(f.price)}, ${dir} ${Math.abs(f.dayChangePct).toFixed(2)}% today` +
      (f.monthChangePct != null ? ` and ${f.monthChangePct >= 0 ? "up" : "down"} ${Math.abs(f.monthChangePct).toFixed(1)}% over the past month.` : "."),
  );

  if (f.sma20 != null && f.sma50 != null) {
    const a20 = f.price > f.sma20, a50 = f.price > f.sma50;
    if (a20 && a50) parts.push(`It sits above both its 20-day (${$(f.sma20)}) and 50-day (${$(f.sma50)}) moving averages, a sign buyers are in control.`);
    else if (!a20 && !a50) parts.push(`It sits below both its 20-day (${$(f.sma20)}) and 50-day (${$(f.sma50)}) moving averages, so sellers have the upper hand.`);
    else parts.push(`It's caught between its 20-day (${$(f.sma20)}) and 50-day (${$(f.sma50)}) moving averages — the trend is undecided.`);
  }

  if (f.rsi14 != null) {
    const r = f.rsi14.toFixed(0);
    if (f.rsi14 >= 70) parts.push(`RSI at ${r} signals overbought conditions, which often precede a pause or pullback.`);
    else if (f.rsi14 <= 30) parts.push(`RSI at ${r} signals oversold conditions, where relief bounces are common.`);
    else parts.push(`RSI at ${r} shows ${f.rsi14 >= 55 ? "firm" : f.rsi14 <= 45 ? "soft" : "neutral"} momentum.`);
  }
  if (f.macdCross) parts.push(`MACD has just made a ${f.macdCross} crossover.`);

  if (f.support != null && f.resistance != null) {
    parts.push(
      `Watch support near ${$(f.support)} (${pct(pctChange(f.price, f.support))}) and resistance near ${$(f.resistance)} (${pct(pctChange(f.price, f.resistance))}).`,
    );
  }
  if (f.volatilityPct != null && f.volatilityPct >= 45) parts.push(`Volatility is elevated, so position sizes matter.`);

  const overall =
    f.sentiment === "bullish" ? "Overall, the technical picture leans bullish."
    : f.sentiment === "bearish" ? "Overall, the technical picture leans bearish."
    : "Overall, signals are mixed — waiting for a break of support or resistance may give a clearer read.";
  parts.push(overall);
  return parts.join(" ");
}
