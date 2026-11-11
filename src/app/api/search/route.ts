import { NextResponse, type NextRequest } from "next/server";
import { searchSymbols } from "@/lib/market";

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 40);
  if (!q) return NextResponse.json({ results: [] });
  return NextResponse.json({ results: await searchSymbols(q) });
}
