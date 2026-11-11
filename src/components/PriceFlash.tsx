"use client";

import { useEffect, useRef, useState } from "react";
import { fmtPrice } from "@/lib/format";

/** Shows a price that briefly flashes green/red when it ticks up/down. */
export default function PriceFlash({ price, className = "" }: { price: number; className?: string }) {
  const prev = useRef(price);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (price === prev.current) return;
    setFlash(price > prev.current ? "up" : "down");
    prev.current = price;
    const t = setTimeout(() => setFlash(null), 600);
    return () => clearTimeout(t);
  }, [price]);

  const color = flash === "up" ? "text-up bg-up/10" : flash === "down" ? "text-down bg-down/10" : "";
  return (
    <span className={`font-mono tabular-nums rounded px-1 -mx-1 transition-colors duration-500 ${color} ${className}`}>
      {fmtPrice(price)}
    </span>
  );
}
