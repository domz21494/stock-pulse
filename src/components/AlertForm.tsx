"use client";

import { useState } from "react";
import { fmtPrice } from "@/lib/format";
import { addAlert, isHit, pushToast } from "@/lib/store";

async function ensureNotificationPermission() {
  if (!("Notification" in window) || Notification.permission !== "default") return;
  try {
    await Notification.requestPermission();
  } catch {}
}

interface Props {
  /** Fixed symbol (stock page) or editable (alerts page) */
  symbol?: string;
  price?: number;
  onSymbolChange?: (s: string) => void;
}

export default function AlertForm({ symbol: fixedSymbol, price, onSymbolChange }: Props) {
  const [symbolInput, setSymbolInput] = useState("");
  const [condition, setCondition] = useState<"above" | "below">("above");
  const [target, setTarget] = useState("");
  const symbol = (fixedSymbol ?? symbolInput).trim().toUpperCase();
  const targetNum = Number(target);
  const valid = /^[A-Z][A-Z0-9.\-]{0,9}$/.test(symbol) && target !== "" && targetNum > 0;
  const alreadyHit = valid && price != null && isHit({ condition, target: targetNum } as never, price);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    await ensureNotificationPermission();
    addAlert({ symbol, condition, target: targetNum });
    pushToast({ title: "Alert created", body: `${symbol} ${condition} $${fmtPrice(targetNum)}`, tone: "info" });
    setTarget("");
  }

  const input = "rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:border-accent";

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-2">
      {!fixedSymbol && (
        <label className="flex flex-col gap-1 text-xs text-muted">
          Symbol
          <input
            value={symbolInput}
            onChange={(e) => {
              setSymbolInput(e.target.value.toUpperCase());
              onSymbolChange?.(e.target.value.toUpperCase());
            }}
            placeholder="AAPL"
            className={`${input} w-24 font-mono uppercase`}
          />
        </label>
      )}
      <label className="flex flex-col gap-1 text-xs text-muted">
        When price goes
        <select value={condition} onChange={(e) => setCondition(e.target.value as "above" | "below")} className={input}>
          <option value="above">above</option>
          <option value="below">below</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs text-muted">
        Target ($)
        <input
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder={price ? fmtPrice(price * (condition === "above" ? 1.01 : 0.99)).replace(/,/g, "") : "0.00"}
          className={`${input} w-32 font-mono`}
        />
      </label>
      <button
        type="submit"
        disabled={!valid}
        className="rounded-md bg-accent px-4 py-1.5 text-sm font-medium text-white disabled:opacity-40"
      >
        Add alert
      </button>
      {alreadyHit && (
        <p className="basis-full text-xs text-amber-400">
          Price is already {condition} this target — the alert will trigger immediately.
        </p>
      )}
    </form>
  );
}
