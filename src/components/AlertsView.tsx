"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useQuotes } from "@/hooks/useQuotes";
import { isValidSymbol } from "@/lib/market/catalog";
import { useAlerts } from "@/lib/store";
import AlertForm from "./AlertForm";
import AlertList from "./AlertList";

type Perm = NotificationPermission | "unsupported";

function useNotificationPermission(): [Perm, () => void] {
  const [, bump] = useState(0);
  const perm = useSyncExternalStore<Perm>(
    () => () => {},
    () => ("Notification" in window ? Notification.permission : "unsupported"),
    () => "default",
  );
  const request = () => {
    if ("Notification" in window) Notification.requestPermission().then(() => bump((n) => n + 1));
  };
  return [perm, request];
}

export default function AlertsView() {
  const alerts = useAlerts();
  const [draftSymbol, setDraftSymbol] = useState("");
  const symbols = useMemo(() => {
    const s = new Set(alerts.map((a) => a.symbol));
    if (isValidSymbol(draftSymbol)) s.add(draftSymbol);
    return [...s].sort();
  }, [alerts, draftSymbol]);
  const { quotes } = useQuotes(symbols);
  const [perm, requestPerm] = useNotificationPermission();

  const active = alerts.filter((a) => !a.triggeredAt);
  const triggered = alerts.filter((a) => a.triggeredAt);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Price Alerts</h1>
        <p className="text-sm text-muted">
          Checked against live prices while StockPulse is open in any tab. Saved in this browser.
        </p>
      </div>

      {perm !== "granted" && (
        <div className="rounded-lg border border-amber-400/40 bg-amber-400/5 p-4 text-sm flex flex-wrap items-center justify-between gap-3">
          <span>
            {perm === "denied"
              ? "Browser notifications are blocked — you'll still see in-app popups. Allow them in your browser's site settings."
              : perm === "unsupported"
                ? "This browser doesn't support notifications — you'll see in-app popups instead."
                : "Turn on browser notifications to be alerted even when this tab is in the background."}
          </span>
          {perm === "default" && (
            <button onClick={requestPerm} className="rounded-md bg-amber-400 px-3 py-1.5 text-xs font-medium text-black">
              Enable notifications
            </button>
          )}
        </div>
      )}

      <section className="rounded-lg border border-border bg-surface p-4 space-y-3">
        <h2 className="font-semibold">New alert</h2>
        <AlertForm price={quotes[draftSymbol]?.price} onSymbolChange={setDraftSymbol} />
        {quotes[draftSymbol] && (
          <p className="text-xs text-muted font-mono">
            {draftSymbol} is trading at ${quotes[draftSymbol].price.toFixed(2)}
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Active ({active.length})</h2>
        <AlertList alerts={active} quotes={quotes} />
      </section>

      {triggered.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold">Triggered ({triggered.length})</h2>
          <AlertList alerts={triggered} quotes={quotes} />
        </section>
      )}
    </div>
  );
}
