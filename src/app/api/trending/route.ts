import { NextRequest, NextResponse } from "next/server";
import { searchNetMirror } from "@/lib/netmirror";

const PROVIDER_NAMES = ["NetMirror"];
const TRENDING_QUERIES = ["2024", "2025", "action", "comedy", "drama", "horror", "sci-fi", "thriller", "romance"];

function toSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function mapItem(r: any, i: number) {
  return {
    _id: String(r.tmdbId || i),
    tmdbId: r.tmdbId || 0,
    type: (r.type === "series" || r.type === "tv") ? "series" as const : "movie" as const,
    title: r.title,
    slug: toSlug(r.title),
    poster: r.imageUrl || "",
    banner: r.image || r.imageUrl || "",
    description: r.description || "",
    year: parseInt(r.year) || 0,
    language: r.language || "en",
    category: r.category || "",
    quality: "HD",
    rating: parseFloat(r.rating) || 0,
    contentRating: "",
    tags: [],
    cast: [],
    trailerEmbedUrl: "",
    hlsLink: "",
    embedIframeLink: "",
    peachifyId: "",
    downloadLink: "",
    netmirrorId: "",
    streams: [],
    provider: "screenscape",
    providerUrl: "",
    createdAt: new Date().toISOString(),
  };
}

export async function GET(request: NextRequest) {
  try {
    const allResults: any[] = [];
    const seen = new Set<string>();

    for (const q of TRENDING_QUERIES) {
      try {
        const results = await searchNetMirror(q);
        for (const r of results) {
          const key = r.title + r.year + r.tmdbId;
          if (!seen.has(key)) { seen.add(key); allResults.push(r); }
        }
      } catch {}
    }

    const mapped = allResults.map(mapItem);

    return NextResponse.json({
      providers: PROVIDER_NAMES,
      selectedProvider: "all",
      featured: mapped.slice(0, 5),
      trending: mapped.slice(0, 30),
      latest: mapped,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}
