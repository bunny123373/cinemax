import { NextRequest, NextResponse } from "next/server";

function resolveUrl(base: string, path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const baseUrl = base.substring(0, base.lastIndexOf("/") + 1);
  return path.startsWith("/")
    ? new URL(path, new URL(base).origin).href
    : new URL(path, baseUrl).href;
}

function rewriteManifest(body: string, sourceUrl: string): string {
  const result = body.replace(/(URI=")([^"]+)(")/gi, (_, before, uri, after) => {
    const absolute = resolveUrl(sourceUrl, uri);
    return `${before}/api/proxy?url=${encodeURIComponent(absolute)}${after}`;
  });

  const lines = result.split("\n");
  const rewritten = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return line;
    if (trimmed.startsWith("/api/proxy")) return line;
    const absolute = resolveUrl(sourceUrl, trimmed);
    return `/api/proxy?url=${encodeURIComponent(absolute)}`;
  });
  return rewritten.join("\n");
}

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0",
  "Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
];

function buildHeaders(url: string, ua: string, referer: string, origin: string, range: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "User-Agent": ua,
    "Accept": "*/*",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Referer": referer,
    "Origin": origin,
  };
  if (range) {
    headers["Range"] = range;
  }
  return headers;
}

async function tryFetch(url: string, ua: string, referer: string, origin: string, range: string | null, retries: number = 3): Promise<Response> {
  for (let attempt = 0; attempt < retries; attempt++) {
    const headers = buildHeaders(url, ua, referer, origin, range);
    const res = await fetch(url, {
      signal: AbortSignal.timeout(30000),
      headers,
    });
    if (res.ok) return res;
    if (res.status === 403 && attempt < retries - 1) {
      await new Promise((r) => setTimeout(r, (attempt + 1) * 1000));
      continue;
    }
    return res;
  }
  const headers = buildHeaders(url, ua, referer, origin, range);
  return await fetch(url, {
    signal: AbortSignal.timeout(30000),
    headers,
  });
}

async function handleResponse(res: Response, sourceUrl: string): Promise<NextResponse> {
  const contentType = res.headers.get("content-type") || "";
  const urlPath = new URL(sourceUrl).pathname;
  const isManifest = urlPath.endsWith(".m3u8") || contentType.includes("mpegurl") || contentType.includes("m3u8");

  if (isManifest) {
    const body = await res.text();
    const rewritten = rewriteManifest(body, sourceUrl);
    return new NextResponse(rewritten, {
      headers: {
        "Content-Type": "application/vnd.apple.mpegurl",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    });
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  return new NextResponse(buffer, {
    status: res.status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "*",
      "Content-Type": contentType || "application/octet-stream",
      ...(res.headers.get("accept-ranges") ? { "Accept-Ranges": res.headers.get("accept-ranges")! } : {}),
      ...(res.headers.get("content-range") ? { "Content-Range": res.headers.get("content-range")! } : {}),
      ...(res.headers.get("content-length") ? { "Content-Length": res.headers.get("content-length")! } : {}),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams.get("url");
    if (!url) return new NextResponse("Missing url param", { status: 400 });
    const range = req.headers.get("range");

    const origin = new URL(url).origin;
    const forwardedReferer = req.headers.get("referer") || origin;
    const ua = req.headers.get("user-agent") || USER_AGENTS[0];

    const res = await tryFetch(url, ua, forwardedReferer, origin, range, 3);

    if (!res.ok) {
      const body = await res.text();
      if (res.status === 403) {
        for (const altUa of USER_AGENTS) {
          if (altUa === ua) continue;
          const altRes = await tryFetch(url, altUa, "https://www.google.com/", new URL(url).origin, range, 1);
          if (altRes.ok) {
            return await handleResponse(altRes, url);
          }
        }
        for (const altUa of USER_AGENTS) {
          if (altUa === ua) continue;
          const altRes = await tryFetch(url, altUa, origin, new URL(url).origin, range, 1);
          if (altRes.ok) {
            return await handleResponse(altRes, url);
          }
        }
        for (const altUa of USER_AGENTS) {
          if (altUa === ua) continue;
          const altRes = await tryFetch(url, altUa, url, new URL(url).origin, range, 1);
          if (altRes.ok) {
            return await handleResponse(altRes, url);
          }
        }
      }
      return new NextResponse(body, {
        status: res.status,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    return await handleResponse(res, url);
  } catch {
    return new NextResponse("Proxy error", {
      status: 502,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    },
  });
}
