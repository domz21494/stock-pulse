import { Suspense } from "react";
import { notFound } from "next/navigation";
import StockHeader from "@/components/StockHeader";
import { CATALOG, FEATURED, isValidSymbol } from "@/lib/market/catalog";

type Params = Promise<{ symbol: string }>;

export function generateStaticParams() {
  return FEATURED.map((symbol) => ({ symbol }));
}

export async function generateMetadata(props: PageProps<"/stock/[symbol]">) {
  const { symbol } = await props.params;
  return { title: `${symbol.toUpperCase()} — StockPulse` };
}

async function StockView({ params }: { params: Params }) {
  const symbol = (await params).symbol.toUpperCase();
  if (!isValidSymbol(symbol)) notFound();
  const name = CATALOG.find((c) => c.symbol === symbol)?.name;

  return (
    <div className="space-y-6">
      <StockHeader symbol={symbol} name={name} />
      <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted">
        Live chart coming in step 3
      </div>
    </div>
  );
}

export default function StockPage({ params }: PageProps<"/stock/[symbol]">) {
  return (
    <Suspense fallback={<div className="h-40 rounded-lg bg-surface animate-pulse" />}>
      <StockView params={params} />
    </Suspense>
  );
}
