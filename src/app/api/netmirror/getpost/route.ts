import { NextRequest, NextResponse } from "next/server";

const ALLOWED_KEYS = [
  process.env.NETMIRROR_API_KEY,
  "sk_snKcEnMmBtq1W-HSsc2sn7vAab1QsS5N",
].filter(Boolean);

export async function GET(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key") || "";
  if (!apiKey || !ALLOWED_KEYS.includes(apiKey)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id") || "";
  if (!id) {
    return NextResponse.json({ success: false, error: "Missing id param" }, { status: 400 });
  }

  try {
    // Try movie first, then TV
    const movieRes = await fetch(`https://screenscape.me/movie/${id}`, {
      signal: AbortSignal.timeout(10000),
    });

    let html: string;
    let mediaType = "movie";

    if (!movieRes.ok) {
      const tvRes = await fetch(`https://screenscape.me/tv/${id}`, {
        signal: AbortSignal.timeout(10000),
      });
      if (!tvRes.ok) {
        return NextResponse.json({
          success: false,
          error: "Not found",
          requestParams: { id, timestamp: new Date().toISOString() },
        }, { status: 404 });
      }
      html = await tvRes.text();
      mediaType = "tv";
    } else {
      html = await movieRes.text();
    }

    // Extract JSON-LD
    const ldRegex = new RegExp('<script[^>]*type="application/ld+json"[^>]*>(.*?)</script>', "is");
    const ldMatch = html.match(ldRegex);
    let structuredData: Record<string, unknown> = {};

    if (ldMatch) {
      try {
        structuredData = JSON.parse(ldMatch[1]);
      } catch {}
    }

    // Extract OG meta
    const ogMatch = (prop: string) => {
      const reg = new RegExp('<meta[^>]*property="og:' + prop + '"[^>]*content="([^"]*)"', "i");
      const m = html.match(reg);
      return m ? m[1] : "";
    };

    return NextResponse.json({
      success: true,
      data: {
        id: Number(id),
        title: structuredData.name || ogMatch("title"),
        overview: structuredData.description || ogMatch("description"),
        poster: ogMatch("image") || "",
        url: ogMatch("url") || "",
        type: mediaType,
        embedUrl: `https://screenscape.me/embed?tmdb=${id}&type=${mediaType}`,
        structuredData,
      },
      requestParams: { id, timestamp: new Date().toISOString() },
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err?.message || "Failed",
      requestParams: { id, timestamp: new Date().toISOString() },
    }, { status: 500 });
  }
}
