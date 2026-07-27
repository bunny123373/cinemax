import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/plugins/registry";

export async function GET(req: NextRequest) {
  const action = req.nextUrl.searchParams.get("action") || "trending";
  try {
    let items;
    const provider = getProvider();
    switch (action) {
      case "hero":
        items = await provider.fetchHero();
        break;
      case "discover":
        items = await provider.fetchDiscover({
          type: req.nextUrl.searchParams.get("type") || undefined,
          sort: req.nextUrl.searchParams.get("sort") || undefined,
          genre: req.nextUrl.searchParams.get("genre") || undefined,
        });
        break;
      default:
        items = await provider.fetchTrending();
    }
    return NextResponse.json({ ok: true, items });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
