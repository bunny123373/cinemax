import { NextRequest, NextResponse } from "next/server";
import { searchNetMirror } from "@/lib/netmirror";

const ALLOWED_KEYS = [
  process.env.NETMIRROR_API_KEY,
  "sk_snKcEnMmBtq1W-HSsc2sn7vAab1QsS5N",
].filter(Boolean);

const CATEGORIES = ["action", "comedy", "drama", "horror", "sci-fi", "thriller", "romance", "2024", "2025"];

export async function GET(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key") || "";
  if (!apiKey || !ALLOWED_KEYS.includes(apiKey)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const query = request.nextUrl.searchParams.get("query") || request.nextUrl.searchParams.get("q") || "";
  if (!query) {
    try {
      const seen = new Set<string>();
      const allItems: NetMirrorItem[] = [];

      for (const cat of CATEGORIES) {
        const results = await searchNetMirror(cat);
        for (const r of results) {
          const key = r.title + r.tmdbId;
          if (!seen.has(key)) {
            seen.add(key);
            allItems.push({
              id: String(r.tmdbId || allItems.length + 1),
              title: r.title,
              imageUrl: r.imageUrl || "",
              postUrl: `/movie/${r.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
              category: cat,
            });
          }
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          items: allItems,
          totalResults: allItems.length,
        },
      });
    } catch (err: any) {
      return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
    }
  }

  try {
    const results = await searchNetMirror(query);
    const items: NetMirrorItem[] = results.map((r: any, i: number) => ({
      id: String(r.tmdbId || i),
      title: r.title,
      imageUrl: r.imageUrl || "",
      postUrl: `/movie/${r.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
      category: r.category || r.type || "movie",
    }));

    return NextResponse.json({
      success: true,
      data: {
        items,
        totalResults: items.length,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "NetMirror API error" }, { status: 500 });
  }
}

interface NetMirrorItem {
  id: string;
  title: string;
  imageUrl: string;
  postUrl: string;
  category: string;
}
