"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { SymbolInfo } from "@/lib/market/types";

export default function SearchBox() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SymbolInfo[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!q.trim()) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        const data = await res.json();
        setResults(data.results ?? []);
        setActive(0);
        setOpen(true);
      } catch {}
    }, 200);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  function go(symbol: string) {
    setOpen(false);
    setQ("");
    setResults([]);
    router.push(`/stock/${symbol}`);
  }

  const shown = q.trim() ? results : [];

  return (
    <div ref={boxRef} className="relative order-last w-full sm:order-none sm:ml-auto sm:max-w-xs">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") setActive((a) => Math.min(a + 1, shown.length - 1));
          else if (e.key === "ArrowUp") setActive((a) => Math.max(a - 1, 0));
          else if (e.key === "Enter") {
            const pick = shown[active]?.symbol ?? q.trim().toUpperCase();
            if (pick) go(pick);
          } else if (e.key === "Escape") setOpen(false);
        }}
        placeholder="Search symbol or company…"
        aria-label="Search stocks"
        className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm placeholder:text-muted focus:outline-none focus:border-accent"
      />
      {open && shown.length > 0 && (
        <ul className="absolute right-0 mt-1 w-full rounded-md border border-border bg-surface shadow-xl overflow-hidden">
          {shown.map((r, i) => (
            <li key={r.symbol}>
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => go(r.symbol)}
                onMouseEnter={() => setActive(i)}
                className={`w-full text-left px-3 py-2 text-sm flex gap-3 ${i === active ? "bg-border" : ""}`}
              >
                <span className="font-mono font-semibold w-14 shrink-0">{r.symbol}</span>
                <span className="text-muted truncate">{r.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
