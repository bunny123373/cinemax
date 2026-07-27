import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/plugins/registry";

export async function GET(req: NextRequest) {
  const tmdbId = req.nextUrl.searchParams.get("tmdbId");
  const dp = req.nextUrl.searchParams.get("dp") || undefined;
  const type = req.nextUrl.searchParams.get("type") || "movie";

  if (!tmdbId) return NextResponse.json({ poster: null });

  try {
    const detail = await getProvider().fetchTitleDetail(type, tmdbId, dp);
    return NextResponse.json({
      poster: detail?.poster || null,
      seasons: detail?.seasons || [],
    });
  } catch {
    return NextResponse.json({ poster: null, seasons: [] });
  }
}
