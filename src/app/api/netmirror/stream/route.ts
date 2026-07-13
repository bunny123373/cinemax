import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";

const ALLOWED_KEYS = [
  process.env.NETMIRROR_API_KEY,
  "sk_snKcEnMmBtq1W-HSsc2sn7vAab1QsS5N",
].filter(Boolean);

const PROXY_BASE = "https://streamhub-proxy.1545zoya.workers.dev";

function buildProxyUrl(videoUrl: string): string {
  return `${PROXY_BASE}/?url=${encodeURIComponent(videoUrl)}`;
}

export async function GET(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key") || "";
  if (!apiKey || !ALLOWED_KEYS.includes(apiKey)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id") || "";
  if (!id) {
    return NextResponse.json({ success: false, error: "Missing id param" }, { status: 400 });
  }

  const timestamp = new Date().toISOString();
  const h = createHash("md5").update(id + timestamp.slice(0, 13)).digest("hex").slice(0, 8);

  try {
    const embedRes = await fetch(`https://net27.cc/api/embed/${encodeURIComponent(id)}`, {
      headers: {
        Referer: "https://net27.cc/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!embedRes.ok) {
      return NextResponse.json({
        success: false,
        error: "NetMirror embed API unavailable",
        requestParams: { id, timestamp, h },
      }, { status: 502 });
    }

    const embedData = await embedRes.json();

    if (!embedData.ok) {
      return NextResponse.json({
        success: false,
        error: embedData.error || "No stream available",
        requestParams: { id, timestamp, h },
      }, { status: 404 });
    }

    const sources: { file: string; label: string; type: string }[] = [];
    let playlistUrl = "";

    if (embedData.mode === "hls" && embedData.m3u8) {
      const url = embedData.cdn ? embedData.m3u8 : buildProxyUrl(embedData.m3u8);
      sources.push({ file: url, label: embedData.resolution || "HD", type: "hls" });
      playlistUrl = url;

      if (embedData.fallbackMp4) {
        sources.push({ file: buildProxyUrl(embedData.fallbackMp4), label: "MP4", type: "mp4" });
      }
    } else if (embedData.mode === "iframe" && embedData.embedUrl) {
      sources.push({ file: embedData.embedUrl, label: "Embed", type: "iframe" });
      playlistUrl = embedData.embedUrl;
    } else if (embedData.mode === "proxy" && embedData.mp4) {
      const url = embedData.direct ? embedData.mp4 : buildProxyUrl(embedData.mp4);
      sources.push({ file: url, label: embedData.resolution || "SD", type: "mp4" });
      playlistUrl = url;
    }

    // Fallback if no sources found
    if (sources.length === 0) {
      const embedUrl = `https://screenscape.me/embed?tmdb=${id}&type=movie`;
      sources.push({ file: embedUrl, label: "Screenscape", type: "iframe" });
      playlistUrl = embedUrl;
    }

    return NextResponse.json({
      success: true,
      data: {
        playlistUrl,
        streamData: { sources },
        requestParams: { id, timestamp, h },
      },
    });
  } catch (err: any) {
    // Fallback to screenscape on error
    const embedUrl = `https://screenscape.me/embed?tmdb=${id}&type=movie`;
    return NextResponse.json({
      success: true,
      data: {
        playlistUrl: embedUrl,
        streamData: {
          sources: [{ file: embedUrl, label: "Screenscape (fallback)", type: "iframe" }],
        },
        requestParams: { id, timestamp, h },
      },
    });
  }
}
