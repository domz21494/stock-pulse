import Link from "next/link";
import AlertsNavLink from "./AlertsNavLink";
import SearchBox from "./SearchBox";

export default function Header() {
  const link = "hover:text-foreground transition-colors";
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center gap-x-6 gap-y-2">
        <Link href="/" className="flex items-center gap-2 font-semibold shrink-0">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-up animate-pulse" />
          StockPulse
        </Link>
        <nav className="flex gap-4 text-sm text-muted">
          <Link href="/" className={link}>Dashboard</Link>
          <Link href="/watchlist" className={link}>Watchlist</Link>
          <AlertsNavLink className={link} />
        </nav>
        <SearchBox />
      </div>
    </header>
  );
}
