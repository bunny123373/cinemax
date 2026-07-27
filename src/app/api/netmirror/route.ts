import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/plugins/registry";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query") || request.nextUrl.searchParams.get("q") || "";

  try {
    if (!query) {
      const provider = getProvider();
      const trending = await provider.fetchTrending();
      const items = trending.slice(0, 30).map((r: any, i: number) => ({
        id: String(r.tmdbId || i),
        title: r.title,
        imageUrl: r.poster || "",
        postUrl: `/movie/${r.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
        category: r.type || "movie",
      }));
      return NextResponse.json({ success: true, data: { items, totalResults: items.length } });
    }

    const results = await getProvider().search(query);
    const items = results.map((r: any, i: number) => ({
      id: String(r.tmdbId || i),
      title: r.title,
      imageUrl: r.poster || "",
      postUrl: `/movie/${r.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
      category: r.type || "movie",
    }));

    return NextResponse.json({ success: true, data: { items, totalResults: items.length } });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Search failed" }, { status: 500 });
  }
}
