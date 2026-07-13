import { NextRequest, NextResponse } from "next/server";
import { fetchTrending, fetchHero, fetchDiscover } from "@/lib/net27";

export async function GET(req: NextRequest) {
  const action = req.nextUrl.searchParams.get("action") || "trending";
  try {
    let items;
    switch (action) {
      case "hero":
        items = await fetchHero();
        break;
      case "discover":
        items = await fetchDiscover({
          type: req.nextUrl.searchParams.get("type") || undefined,
          sort: req.nextUrl.searchParams.get("sort") || undefined,
          genre: req.nextUrl.searchParams.get("genre") || undefined,
        });
        break;
      default:
        items = await fetchTrending();
    }
    return NextResponse.json({ ok: true, items });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
