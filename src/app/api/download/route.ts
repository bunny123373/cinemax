import { NextRequest } from "next/server";

const STREAMBOX_BASE = "https://streambox.sonixhub.net";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const filename = req.nextUrl.searchParams.get("filename") || "download.mp4";
  const referer = req.nextUrl.searchParams.get("referer") || "https://netfilm.world/";

  if (!url) {
    return new Response("Missing url param", { status: 400 });
  }

  const proxyUrl = `${STREAMBOX_BASE}/api/proxy-stream?${new URLSearchParams({
    url,
    referer,
    filename,
  }).toString()}`;

  const upstream = await fetch(proxyUrl, {
    headers: { referer: STREAMBOX_BASE + "/" },
  });

  if (!upstream.ok || !upstream.body) {
    return new Response("Proxy fetch failed", { status: upstream.status || 502 });
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
