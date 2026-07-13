import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const title = req.nextUrl.searchParams.get("title") || "cinemax";

  if (!url) return new NextResponse("Missing url", { status: 400 });

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "*/*",
      },
      signal: AbortSignal.timeout(120000),
    });

    if (!res.ok) {
      return new NextResponse("Failed to fetch", { status: res.status });
    }

    const contentType = res.headers.get("content-type") || "video/mp4";
    const contentLength = res.headers.get("content-length");

    const safeName = title.replace(/[^a-zA-Z0-9\s\-_.()]/g, "").replace(/\s+/g, "_");
    const ext = contentType.includes("mp4") ? ".mp4" : contentType.includes("mkv") ? ".mkv" : contentType.includes("webm") ? ".webm" : ".mp4";

    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("Content-Disposition", `attachment; filename="${safeName}${ext}"`);
    headers.set("Access-Control-Allow-Origin", "*");
    if (contentLength) headers.set("Content-Length", contentLength);

    return new NextResponse(res.body, { status: 200, headers });
  } catch {
    return new NextResponse("Download failed", { status: 500 });
  }
}
