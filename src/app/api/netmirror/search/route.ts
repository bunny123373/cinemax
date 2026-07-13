import { NextRequest, NextResponse } from "next/server";
import { searchNetMirror } from "@/lib/netmirror";

const ALLOWED_KEYS = [
  process.env.NETMIRROR_API_KEY,
  "sk_snKcEnMmBtq1W-HSsc2sn7vAab1QsS5N",
].filter(Boolean);

export async function GET(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key") || "";
  if (!apiKey || !ALLOWED_KEYS.includes(apiKey)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const query = request.nextUrl.searchParams.get("q") || "";
  if (!query) {
    return NextResponse.json({ success: false, error: "Missing query param 'q'" }, { status: 400 });
  }

  try {
    const results = await searchNetMirror(query);

    return NextResponse.json({
      success: true,
      data: {
        searchUrl: `https://screenscape.me/search?q=${encodeURIComponent(query)}`,
        searchResults: results as unknown as Record<string, unknown>,
        requestParams: {
          query,
          timestamp: new Date().toISOString(),
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Search failed" }, { status: 500 });
  }
}
