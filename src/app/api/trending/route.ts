import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/plugins/registry";

function toSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function mapItem(r: any) {
  return {
    _id: String(r.tmdbId || ""),
    tmdbId: r.tmdbId || 0,
    type: (r.type === "series" || r.type === "tv") ? "series" as const : "movie" as const,
    title: r.title,
    slug: toSlug(r.title),
    poster: r.poster || "",
    banner: r.backdrop || r.poster || "",
    description: r.overview || "",
    year: parseInt(r.year) || 0,
    language: "en",
    category: "",
    quality: "HD",
    rating: r.rating || 0,
    contentRating: "",
    tags: [],
    cast: [],
    trailerEmbedUrl: "",
    hlsLink: "",
    embedIframeLink: "",
    provider: "netflix",
    providerUrl: "",
    createdAt: new Date().toISOString(),
  };
}

export async function GET() {
  try {
    const provider = getProvider();
    const trending = await provider.fetchTrending();
    const movies = await provider.fetchDiscover({ type: "movie" });
    const series = await provider.fetchDiscover({ type: "tv" });

    const seen = new Set<string>();
    const all: any[] = [];

    for (const item of [...trending, ...movies, ...series]) {
      const key = item.tmdbId + item.title;
      if (!seen.has(key)) {
        seen.add(key);
        all.push(mapItem(item));
      }
    }

    return NextResponse.json({
      providers: ["Netflix"],
      selectedProvider: "netflix",
      featured: all.slice(0, 5),
      trending: all.slice(0, 30),
      latest: all,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}
