"use client";

import { useSyncExternalStore } from "react";

/**
 * Tiny localStorage-backed store usable with useSyncExternalStore.
 * Syncs across tabs via the `storage` event; falls back to memory if storage is unavailable.
 */
function createStore<T>(key: string, initial: T) {
  let value: T = initial;
  let loaded = false;
  const listeners = new Set<() => void>();

  function load() {
    if (loaded || typeof window === "undefined") return;
    loaded = true;
    try {
      const raw = localStorage.getItem(key);
      if (raw) value = JSON.parse(raw);
    } catch {}
  }

  function emit() {
    listeners.forEach((l) => l());
  }

  return {
    get(): T {
      load();
      return value;
    },
    set(next: T | ((prev: T) => T)) {
      load();
      value = typeof next === "function" ? (next as (p: T) => T)(value) : next;
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {}
      emit();
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      const onStorage = (e: StorageEvent) => {
        if (e.key !== key) return;
        try {
          value = e.newValue ? JSON.parse(e.newValue) : initial;
        } catch {}
        emit();
      };
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", onStorage);
      };
    },
    initial,
  };
}

function useStore<T>(store: ReturnType<typeof createStore<T>>) {
  return useSyncExternalStore(store.subscribe, store.get, () => store.initial);
}

/* ---------------- Watchlist ---------------- */

const EMPTY: string[] = [];
const watchlistStore = createStore<string[]>("stockpulse:watchlist", EMPTY);

export const useWatchlist = () => useStore(watchlistStore);

export function toggleWatch(symbol: string) {
  watchlistStore.set((w) => (w.includes(symbol) ? w.filter((s) => s !== symbol) : [...w, symbol]));
}

/* ---------------- Alerts ---------------- */

export interface PriceAlert {
  id: string;
  symbol: string;
  condition: "above" | "below";
  target: number;
  createdAt: number;
  triggeredAt?: number;
  triggeredPrice?: number;
}

const NO_ALERTS: PriceAlert[] = [];
const alertsStore = createStore<PriceAlert[]>("stockpulse:alerts", NO_ALERTS);

export const useAlerts = () => useStore(alertsStore);

export function addAlert(a: Pick<PriceAlert, "symbol" | "condition" | "target">) {
  const alert: PriceAlert = { ...a, id: crypto.randomUUID(), createdAt: Date.now() };
  alertsStore.set((list) => [alert, ...list]);
  return alert;
}

export function removeAlert(id: string) {
  alertsStore.set((list) => list.filter((a) => a.id !== id));
}

export function rearmAlert(id: string) {
  alertsStore.set((list) =>
    list.map((a) => (a.id === id ? { ...a, triggeredAt: undefined, triggeredPrice: undefined } : a)),
  );
}

export function markTriggered(id: string, price: number) {
  alertsStore.set((list) =>
    list.map((a) => (a.id === id && !a.triggeredAt ? { ...a, triggeredAt: Date.now(), triggeredPrice: price } : a)),
  );
}

export const isHit = (a: PriceAlert, price: number) =>
  a.condition === "above" ? price >= a.target : price <= a.target;

/* ---------------- Toasts ---------------- */

export interface Toast {
  id: string;
  title: string;
  body: string;
  tone: "up" | "down" | "info";
  href?: string;
}

const NO_TOASTS: Toast[] = [];
let toasts: Toast[] = NO_TOASTS;
const toastListeners = new Set<() => void>();
const emitToasts = () => toastListeners.forEach((l) => l());

export function pushToast(t: Omit<Toast, "id">) {
  const toast = { ...t, id: crypto.randomUUID() };
  toasts = [...toasts, toast];
  emitToasts();
  setTimeout(() => dismissToast(toast.id), 8000);
}

export function dismissToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  emitToasts();
}

export function useToasts() {
  return useSyncExternalStore(
    (l) => {
      toastListeners.add(l);
      return () => toastListeners.delete(l);
    },
    () => toasts,
    () => NO_TOASTS,
  );
}
