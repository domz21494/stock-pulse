import { NextResponse, type NextRequest } from "next/server";
import { isValidSymbol } from "@/lib/market/catalog";
import { getInsight } from "@/lib/insights";

export async function GET(req: NextRequest) {
  const symbol = (req.nextUrl.searchParams.get("symbol") ?? "").toUpperCase();
  if (!isValidSymbol(symbol)) {
    return NextResponse.json({ error: "Provide ?symbol=AAPL" }, { status: 400 });
  }
  const fresh = req.nextUrl.searchParams.has("refresh");
  return NextResponse.json(await getInsight(symbol, fresh), { headers: { "Cache-Control": "no-store" } });
}
