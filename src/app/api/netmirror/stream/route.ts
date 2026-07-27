import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/plugins/registry";

const PROXY_BASE = "https://streamhub-proxy.1545zoya.workers.dev";

function buildProxyUrl(videoUrl: string): string {
  return `${PROXY_BASE}/?url=${encodeURIComponent(videoUrl)}`;
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id") || "";
  const type = request.nextUrl.searchParams.get("type") || "movie";

  if (!id) {
    return NextResponse.json({ success: false, error: "Missing id param" }, { status: 400 });
  }

  try {
    const provider = getProvider();
    const embed = await provider.fetchEmbedSource(id, type);
    if (!embed) {
      return NextResponse.json({ success: false, error: "No stream available" }, { status: 404 });
    }

    const stream = provider.resolveStreamUrl(embed);
    const sources: { file: string; label: string; type: string }[] = [];

    if (stream) {
      const url = embed.direct ? stream.url : buildProxyUrl(stream.url);
      sources.push({ file: url, label: embed.resolution || "HD", type: stream.mimeType.includes("mpegurl") ? "hls" : "mp4" });
    }

    if (embed.streams) {
      for (const s of embed.streams) {
        const url = embed.direct ? s.url : buildProxyUrl(s.url);
        sources.push({ file: url, label: `${s.resolution}p`, type: s.url.includes(".m3u8") ? "hls" : "mp4" });
      }
    }

    if (embed.mp4 && !sources.some((s) => s.file.includes(embed.mp4!))) {
      sources.push({ file: embed.mp4, label: embed.resolution || "MP4", type: "mp4" });
    }

    const playlistUrl = sources[0]?.file || "";

    return NextResponse.json({
      success: true,
      data: {
        playlistUrl,
        streamData: { sources },
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Stream fetch failed" }, { status: 500 });
  }
}
