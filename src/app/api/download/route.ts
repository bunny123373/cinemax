import { NextRequest } from "next/server";

function detectReferer(url: string): string {
  try {
    const host = new URL(url).hostname;
    if (host.includes("hakunaymatata") || host.includes("bcdnxw")) return "https://moviebox.ph/";
    if (host.includes("sonixhub") || host.includes("streambox")) return "https://streambox.sonixhub.net/";
    if (host.includes("net27")) return "https://net27.cc/";
    return "https://net27.cc/";
  } catch {
    return "https://net27.cc/";
  }
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const filename = req.nextUrl.searchParams.get("filename") || "download.mp4";
  const referer = req.nextUrl.searchParams.get("referer") || detectReferer(url || "");

  if (!url) {
    return new Response("Missing url param", { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      headers: {
        referer,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(30000),
    });
  } catch {
    return new Response("Proxy fetch failed", { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    return new Response("Upstream returned error", { status: upstream.status || 502 });
  }

  const contentType = upstream.headers.get("content-type") || "video/mp4";
  const contentLength = upstream.headers.get("content-length");

  const headers = new Headers({
    "Content-Type": contentType,
    "Content-Disposition": `attachment; filename="${filename}"`,
    "Cache-Control": "no-store",
  });
  if (contentLength) headers.set("Content-Length", contentLength);

  return new Response(upstream.body, { status: 200, headers });
}
