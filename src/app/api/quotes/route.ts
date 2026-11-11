import { NextResponse, type NextRequest } from "next/server";
import { isValidSymbol } from "@/lib/market/catalog";
import { dataMode, getQuotes, pollInterval } from "@/lib/market";
import type { QuotesResponse } from "@/lib/market/types";

export async function GET(req: NextRequest) {
  const symbols = (req.nextUrl.searchParams.get("symbols") ?? "")
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(isValidSymbol)
    .slice(0, 20);

  if (symbols.length === 0) {
    return NextResponse.json({ error: "Provide ?symbols=AAPL,MSFT" }, { status: 400 });
  }

  const body: QuotesResponse = {
    mode: dataMode(),
    interval: pollInterval(),
    quotes: await getQuotes([...new Set(symbols)]),
  };
  return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
}
