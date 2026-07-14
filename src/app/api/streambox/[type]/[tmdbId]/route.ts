import { NextRequest, NextResponse } from "next/server";

const STREAMBOX_BASE = "https://streambox.sonixhub.net";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ type: string; tmdbId: string }> }
) {
  const { type, tmdbId } = await params;
  const season = req.nextUrl.searchParams.get("season");
  const episode = req.nextUrl.searchParams.get("episode");

  const streamPath =
    type === "series" && season && episode
      ? `/stream/series/${tmdbId}/${season}/${episode}`
      : `/stream/movie/${tmdbId}`;

  const downloadPath =
    type === "series" && season && episode
      ? `/download/series/${tmdbId}/${season}/${episode}`
      : `/download/movie/${tmdbId}`;

  try {
    const res = await fetch(`${STREAMBOX_BASE}${streamPath}?server=blaze&download=true`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    });

    return NextResponse.json({
      ok: res.ok,
      streamUrl: `${STREAMBOX_BASE}${streamPath}`,
      downloadUrl: `${STREAMBOX_BASE}${downloadPath}`,
      embedUrl: `${STREAMBOX_BASE}${streamPath}?server=blaze&download=true`,
    });
  } catch {
    return NextResponse.json({
      ok: false,
      streamUrl: `${STREAMBOX_BASE}${streamPath}`,
      downloadUrl: `${STREAMBOX_BASE}${downloadPath}`,
      embedUrl: `${STREAMBOX_BASE}${streamPath}?server=blaze&download=true`,
    });
  }
}
