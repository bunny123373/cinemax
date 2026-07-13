import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Content } from "@/lib/models/Content";
import { getMovieDetails, getTvDetails, tmdbFetch } from "@/lib/tmdb";
import { searchNetMirror, getProviderStream } from "@/lib/netmirror";

function validateAdmin(request: NextRequest) {
  const key = request.headers.get("x-admin-key");
  return key === process.env.ADMIN_KEY;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export async function POST(request: NextRequest) {
  if (!validateAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = await connectDB();
    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    const body = await request.json();
    const { tmdbId, type, hlsLink, embedIframeLink, peachifyId, downloadLink, netmirrorId, seasons, language, streams, contentRating } = body;

    let data;
    try {
      data = type === "movie"
        ? await getMovieDetails(tmdbId)
        : await getTvDetails(tmdbId);
    } catch {
      return NextResponse.json({ error: "Failed to fetch from TMDB — check your API key and network" }, { status: 400 });
    }

    const title = data.title || data.name;
    const slug = generateSlug(title);
    const year = new Date(data.release_date || data.first_air_date || "").getFullYear() || new Date().getFullYear();

    const trailer = data.videos?.results?.find(
      (v: any) => v.site === "YouTube" && v.type === "Trailer"
    );

    const cast = (data.credits?.cast || []).slice(0, 8).map((c: any) => ({
      name: c.name,
      character: c.character,
      profileImage: c.profile_path
        ? `https://image.tmdb.org/t/p/w500${c.profile_path}`
        : "",
    }));

    const category = data.genres?.[0]?.name || "Action";
    const tags = data.genres?.map((g: any) => g.name) || [];

    let netmirrorStreams: { language: string; hlsLink: string; embedIframeLink: string }[] = [];
    if (netmirrorId) {
      try {
        const streamData = await getProviderStream("netmirror", netmirrorId) as any;
        if (streamData?.streams) {
          netmirrorStreams = streamData.streams.map((s: any) => ({
            language: s.language || "English",
            hlsLink: s.hls || s.hlsLink || "",
            embedIframeLink: s.embed || s.embedIframeLink || "",
          }));
        }
      } catch {
        // NetMirror fetch failed, proceed without it
      }
    }

    const contentData: any = {
      type,
      tmdbId: Number(tmdbId),
      title,
      slug,
      poster: data.poster_path
        ? `https://image.tmdb.org/t/p/original${data.poster_path}`
        : "",
      banner: data.backdrop_path
        ? `https://image.tmdb.org/t/p/original${data.backdrop_path}`
        : "",
      description: data.overview || "",
      year,
      language: language || "English",
      category,
      quality: "1080p",
      rating: data.vote_average || 0,
      contentRating: contentRating || "TV-MA",
      tags,
      trailerEmbedUrl: trailer
        ? `https://www.youtube.com/embed/${trailer.key}`
        : "",
      cast,
      netmirrorId: netmirrorId || "",
    };

    contentData.downloadLink = downloadLink || "";
    contentData.peachifyId = peachifyId || String(tmdbId);

    if (streams && streams.length > 0) {
      contentData.streams = streams;
    } else if (netmirrorStreams.length > 0) {
      contentData.streams = netmirrorStreams;
      const primaryStream = netmirrorStreams[0];
      if (primaryStream.hlsLink) contentData.hlsLink = primaryStream.hlsLink;
      if (primaryStream.embedIframeLink) contentData.embedIframeLink = primaryStream.embedIframeLink;
    } else {
      contentData.hlsLink = hlsLink || "";
      contentData.embedIframeLink = embedIframeLink || "";
      contentData.streams = streams || [];
    }

    if (type === "movie") {
      if (!contentData.hlsLink) contentData.hlsLink = hlsLink || "";
      if (!contentData.embedIframeLink) contentData.embedIframeLink = embedIframeLink || "";
    } else {
      const seasonData = seasons?.map((s: any) => ({
        ...s,
        episodes: s.episodes?.map((ep: any) => ({
          ...ep,
          streams: streams || netmirrorStreams || [],
        })),
      })) || [];

      for (const season of seasonData) {
        try {
          const tmdbSeason = await tmdbFetch(`/tv/${tmdbId}/season/${season.seasonNumber}`);
          if (tmdbSeason?.episodes) {
            const epMap = new Map(tmdbSeason.episodes.map((e: any) => [e.episode_number, e]));
            for (const ep of season.episodes) {
              const tmdbEp: any = epMap.get(ep.episodeNumber);
              if (tmdbEp) {
                ep.episodeTitle = tmdbEp.name || ep.episodeTitle;
                ep.thumbnail = tmdbEp.still_path
                  ? `https://image.tmdb.org/t/p/w500${tmdbEp.still_path}`
                  : ep.thumbnail || "";
                ep.overview = tmdbEp.overview || "";
              }
            }
          }
        } catch {
          // fallback
        }
      }

      contentData.seasons = seasonData;
    }

    const existing = await Content.findOne({ slug });
    if (existing) {
      return NextResponse.json({ message: "Content already exists", content: existing });
    }

    const content = await Content.create(contentData);
    return NextResponse.json(content, { status: 201 });
  } catch (error: any) {
    const msg = error?.message || "Failed to seed content";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
