/** Pure technical-indicator helpers over arrays of closes (oldest first). */

export function sma(values: number[], period: number): number | null {
  if (values.length < period) return null;
  const slice = values.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

export function emaSeries(values: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const out: number[] = [];
  values.forEach((v, i) => out.push(i === 0 ? v : v * k + out[i - 1] * (1 - k)));
  return out;
}

/** Wilder's RSI */
export function rsi(values: number[], period = 14): number | null {
  if (values.length <= period) return null;
  let gain = 0, loss = 0;
  for (let i = 1; i <= period; i++) {
    const d = values[i] - values[i - 1];
    if (d >= 0) gain += d; else loss -= d;
  }
  gain /= period; loss /= period;
  for (let i = period + 1; i < values.length; i++) {
    const d = values[i] - values[i - 1];
    gain = (gain * (period - 1) + Math.max(d, 0)) / period;
    loss = (loss * (period - 1) + Math.max(-d, 0)) / period;
  }
  if (loss === 0) return 100;
  return 100 - 100 / (1 + gain / loss);
}

export function macd(values: number[]) {
  if (values.length < 35) return null;
  const fast = emaSeries(values, 12);
  const slow = emaSeries(values, 26);
  const line = fast.map((f, i) => f - slow[i]);
  const signal = emaSeries(line.slice(25), 9);
  const n = line.length - 1;
  const hist = line[n] - signal[signal.length - 1];
  const prevHist = line[n - 1] - signal[signal.length - 2];
  return { line: line[n], signal: signal[signal.length - 1], hist, prevHist };
}

/** Annualized volatility (%) from daily closes. */
export function volatility(values: number[], period = 20): number | null {
  if (values.length <= period) return null;
  const rets = [];
  for (let i = values.length - period; i < values.length; i++) rets.push(Math.log(values[i] / values[i - 1]));
  const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
  const variance = rets.reduce((a, r) => a + (r - mean) ** 2, 0) / (rets.length - 1);
  return Math.sqrt(variance) * Math.sqrt(252) * 100;
}

export const pctChange = (from: number, to: number) => ((to - from) / from) * 100;
