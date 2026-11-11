import { NextResponse, type NextRequest } from "next/server";
import { isValidSymbol } from "@/lib/market/catalog";
import { getCandles } from "@/lib/market";
import { isRangeKey } from "@/lib/market/ranges";

export async function GET(req: NextRequest) {
  const symbol = (req.nextUrl.searchParams.get("symbol") ?? "").toUpperCase();
  const range = req.nextUrl.searchParams.get("range") ?? "1D";
  if (!isValidSymbol(symbol) || !isRangeKey(range)) {
    return NextResponse.json({ error: "Provide ?symbol=AAPL&range=1D|1W|1M|3M" }, { status: 400 });
  }
  return NextResponse.json(await getCandles(symbol, range), {
    headers: { "Cache-Control": "no-store" },
  });
}
