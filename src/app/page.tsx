const featured = ["AAPL", "MSFT", "NVDA", "TSLA", "AMZN", "GOOGL"];

export default function Home() {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold">Market Dashboard</h1>
        <p className="text-sm text-muted">Live prices, charts, alerts and AI insights.</p>
      </section>
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {featured.map((s) => (
          <div key={s} className="rounded-lg border border-border bg-surface p-4">
            <div className="font-mono text-sm">{s}</div>
            <div className="mt-2 h-6 w-20 rounded bg-border animate-pulse" />
          </div>
        ))}
      </section>
    </div>
  );
}
