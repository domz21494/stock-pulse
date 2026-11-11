"use client";

import { useEffect, useMemo } from "react";
import { useQuotes } from "@/hooks/useQuotes";
import { fmtPrice } from "@/lib/format";
import { isHit, markTriggered, pushToast, useAlerts } from "@/lib/store";

/** Mounted once in the layout: watches live prices and fires any alerts that are hit. */
export default function AlertEngine() {
  const alerts = useAlerts();
  const active = useMemo(() => alerts.filter((a) => !a.triggeredAt), [alerts]);
  const symbols = useMemo(() => [...new Set(active.map((a) => a.symbol))].sort(), [active]);
  const { quotes } = useQuotes(symbols);

  useEffect(() => {
    for (const a of active) {
      const q = quotes[a.symbol];
      if (!q || !isHit(a, q.price)) continue;
      markTriggered(a.id, q.price);
      const title = `${a.symbol} ${a.condition === "above" ? "rose above" : "fell below"} $${fmtPrice(a.target)}`;
      const body = `Now trading at $${fmtPrice(q.price)}`;
      pushToast({ title, body, tone: a.condition === "above" ? "up" : "down", href: `/stock/${a.symbol}` });
      if ("Notification" in window && Notification.permission === "granted") {
        try {
          new Notification(`🔔 ${title}`, { body, tag: a.id });
        } catch {}
      }
    }
  }, [quotes, active]);

  return null;
}
