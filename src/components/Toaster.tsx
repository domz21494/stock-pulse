"use client";

import Link from "next/link";
import { dismissToast, useToasts } from "@/lib/store";

export default function Toaster() {
  const toasts = useToasts();
  return (
    <div aria-live="polite" className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-[min(360px,calc(100vw-2rem))]">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`rounded-lg border bg-surface shadow-2xl p-4 animate-[toast-in_.25s_ease-out] ${
            t.tone === "up" ? "border-up/50" : t.tone === "down" ? "border-down/50" : "border-border"
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="text-lg leading-none">🔔</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{t.title}</p>
              <p className="text-xs text-muted mt-0.5">{t.body}</p>
              {t.href && (
                <Link href={t.href} onClick={() => dismissToast(t.id)} className="text-xs text-accent mt-1 inline-block">
                  View chart →
                </Link>
              )}
            </div>
            <button onClick={() => dismissToast(t.id)} aria-label="Dismiss" className="text-muted hover:text-foreground">
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
