import { NextRequest, NextResponse } from "next/server";
import { getSeasonDetails } from "@/lib/tmdb";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ tvId: string; season: string }> }
) {
  const { tvId, season } = await params;
  try {
    const data = await getSeasonDetails(Number(tvId), Number(season));
    const episodes = (data.episodes || []).map((ep: { episode_number: number; name: string; overview?: string; still_path?: string | null; runtime?: number }) => ({
      episode: ep.episode_number,
      name: ep.name,
      overview: ep.overview || "",
      still: ep.still_path ? `https://image.tmdb.org/t/p/w342${ep.still_path}` : null,
      runtime: ep.runtime || 0,
    }));
    return NextResponse.json({ ok: true, episodes }, {
      headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=86400" },
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
