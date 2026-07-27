import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/plugins/registry";

export const dynamic = "force-dynamic";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";

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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ tvId: string; season: string }> }
) {
  const { tvId, season } = await params;

  const tmdbEpisodes = await fetchFromTMDB(tvId, season);
  if (tmdbEpisodes && tmdbEpisodes.length > 0) {
    return NextResponse.json({ ok: true, episodes: tmdbEpisodes, source: "tmdb" });
  }

  try {
    const detail = await getProvider().fetchTitleDetail("tv", tvId);
    if (detail?.seasons) {
      const seasonData = detail.seasons.find((s) => s.season_number === Number(season));
      const episodeCount = seasonData?.episode_count || 10;

      const episodes = Array.from({ length: episodeCount }, (_, i) => ({
        episode: i + 1,
        name: detail.initialEpisodes?.find((e) => e.episode === i + 1)?.name || `Episode ${i + 1}`,
        overview: detail.initialEpisodes?.find((e) => e.episode === i + 1)?.overview || "",
        still: detail.initialEpisodes?.find((e) => e.episode === i + 1)?.still || null,
        runtime: 0,
      }));

      return NextResponse.json({ ok: true, episodes, source: "netflix" });
    }
  } catch {
    // fall through
  }

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
