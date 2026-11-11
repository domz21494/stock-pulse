"use client";

import Link from "next/link";
import { useAlerts } from "@/lib/store";

export default function AlertsNavLink({ className }: { className: string }) {
  const active = useAlerts().filter((a) => !a.triggeredAt).length;
  return (
    <Link href="/alerts" className={`${className} inline-flex items-center gap-1.5`}>
      Alerts
      {active > 0 && (
        <span className="rounded-full bg-accent px-1.5 text-[10px] leading-4 font-semibold text-white">{active}</span>
      )}
    </Link>
  );
}
