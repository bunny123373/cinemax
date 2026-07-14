import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";
const NET27_BASE = "https://net27.cc";

async function fetchFromTMDB(tvId: string, season: string) {
  if (!TMDB_API_KEY) return null;
  try {
    const res = await fetch(`${TMDB_BASE}/tv/${tvId}/season/${season}?api_key=${TMDB_API_KEY}`, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (data.episodes || []).map((ep: { episode_number: number; name: string; overview?: string; still_path?: string | null; runtime?: number }) => ({
      episode: ep.episode_number,
      name: ep.name,
      overview: ep.overview || "",
      still: ep.still_path ? `https://image.tmdb.org/t/p/w342${ep.still_path}` : null,
      runtime: ep.runtime || 0,
    }));
  } catch {
    return null;
  }
}

async function fetchFromNet27(tmdbId: string, season: string, episodeCount: number) {
  const episodes = [];
  for (let ep = 1; ep <= Math.min(episodeCount, 50); ep++) {
    try {
      const url = `${NET27_BASE}/api/embed-tmdb/${tmdbId}?type=tv&se=${season}&ep=${ep}`;
      const res = await fetch(url, {
        signal: AbortSignal.timeout(5000),
        cache: "no-store",
      });
      const data = await res.json();
      episodes.push({
        episode: ep,
        name: data.title || `Episode ${ep}`,
        overview: "",
        still: data.poster || null,
        runtime: 0,
      });
    } catch {
      episodes.push({
        episode: ep,
        name: `Episode ${ep}`,
        overview: "",
        still: null,
        runtime: 0,
      });
    }
  }
  return episodes;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ tvId: string; season: string }> }
) {
  const { tvId, season } = await params;

  // Try TMDB first
  const tmdbEpisodes = await fetchFromTMDB(tvId, season);
  if (tmdbEpisodes && tmdbEpisodes.length > 0) {
    return NextResponse.json({ ok: true, episodes: tmdbEpisodes, source: "tmdb" });
  }

  // Fallback: get episode count from Net27 detail, then probe each episode
  try {
    const detailRes = await fetch(`${NET27_BASE}/api/catalog/title/tv/${tvId}`, {
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    const detail = await detailRes.json();
    const seasonData = (detail.seasons || []).find((s: { season_number: number; episode_count: number }) => s.season_number === Number(season));
    const episodeCount = seasonData?.episode_count || 10;

    const episodes = await fetchFromNet27(tvId, season, episodeCount);
    return NextResponse.json({ ok: true, episodes, source: "net27" });
  } catch {
    // Final fallback: return numbered placeholders
    const count = 10;
    const episodes = Array.from({ length: count }, (_, i) => ({
      episode: i + 1,
      name: `Episode ${i + 1}`,
      overview: "",
      still: null,
      runtime: 0,
    }));
    return NextResponse.json({ ok: true, episodes, source: "placeholder" });
  }
}
