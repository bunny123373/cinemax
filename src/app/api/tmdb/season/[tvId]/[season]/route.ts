import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ tvId: string; season: string }> }
) {
  const { tvId, season } = await params;

  if (!TMDB_API_KEY) {
    return NextResponse.json({ ok: false, error: "TMDB_API_KEY not set" }, { status: 500 });
  }

  try {
    const url = `${TMDB_BASE}/tv/${tvId}/season/${season}?api_key=${TMDB_API_KEY}`;
    const res = await fetch(url, {
      headers: { accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json({ ok: false, error: `TMDB ${res.status}: ${text.slice(0, 200)}` }, { status: 500 });
    }
    const data = await res.json();
    const episodes = (data.episodes || []).map((ep: { episode_number: number; name: string; overview?: string; still_path?: string | null; runtime?: number }) => ({
      episode: ep.episode_number,
      name: ep.name,
      overview: ep.overview || "",
      still: ep.still_path ? `https://image.tmdb.org/t/p/w342${ep.still_path}` : null,
      runtime: ep.runtime || 0,
    }));
    return NextResponse.json({ ok: true, episodes });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
