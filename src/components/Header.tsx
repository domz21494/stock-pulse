import Link from "next/link";
import SearchBox from "./SearchBox";

const nav = [
  { href: "/", label: "Dashboard" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/alerts", label: "Alerts" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 font-semibold shrink-0">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-up animate-pulse" />
          StockPulse
        </Link>
        <nav className="hidden sm:flex gap-4 text-sm text-muted">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-foreground transition-colors">
              {n.label}
            </Link>
          ))}
        </nav>
        <SearchBox />
      </div>
    </header>
  );
}
