"use client";

import { useState } from "react";
import Link from "next/link";
import { Play } from "lucide-react";

interface Episode {
  episode: number;
  name: string;
  overview?: string;
  still?: string | null;
  runtime?: number;
}

interface Season {
  season_number: number;
  name: string;
  episode_count: number;
}

interface SeasonEpisodesProps {
  seasons: Season[];
  initialSeason: number;
  initialEpisodes: Episode[];
  tmdbId: number;
  type: string;
  titleSlug: string;
}

function buildEpisodes(seasonNum: number, initialSeason: number, initialEpisodes: Episode[], seasons: Season[]): Episode[] {
  if (seasonNum === initialSeason && initialEpisodes.length > 0) {
    return initialEpisodes;
  }
  const s = seasons.find((x) => x.season_number === seasonNum);
  const count = s?.episode_count || 0;
  return Array.from({ length: count }, (_, i) => ({
    episode: i + 1,
    name: `Episode ${i + 1}`,
    overview: "",
    still: null,
  }));
}

export default function SeasonEpisodes({ seasons, initialSeason, initialEpisodes, tmdbId, type, titleSlug }: SeasonEpisodesProps) {
  const [selectedSeason, setSelectedSeason] = useState(initialSeason);
  const [episodes, setEpisodes] = useState<Episode[]>(initialEpisodes);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

  function handleSeasonChange(seasonNum: number) {
    setSelectedSeason(seasonNum);
    setEpisodes(buildEpisodes(seasonNum, initialSeason, initialEpisodes, seasons));
    setFailedImages(new Set());
  }

  function handleImageError(episode: number) {
    setFailedImages((prev) => new Set(prev).add(episode));
  }

  const currentSeason = seasons.find((s) => s.season_number === selectedSeason);

  return (
    <div className="mt-8 md:mt-12">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-white">Episodes</h2>
        {seasons.length > 1 && (
          <select
            value={selectedSeason}
            onChange={(e) => handleSeasonChange(Number(e.target.value))}
            className="px-3 py-2 bg-[#12121a] border border-[#2a2a3a] text-white text-sm appearance-none cursor-pointer pr-8"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238e8ea0' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 8px center",
            }}
          >
            {seasons.map((s) => (
              <option key={s.season_number} value={s.season_number}>
                {s.name || `Season ${s.season_number}`} ({s.episode_count} ep)
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex gap-3 md:gap-4 overflow-x-auto scroll-smooth pb-4 scrollbar-hide">
        {episodes.map((ep) => (
          <Link
            key={`${selectedSeason}-${ep.episode}`}
            href={`/series/watch/${titleSlug}?tmdbId=${tmdbId}&type=${type}&season=${selectedSeason}&episode=${ep.episode}`}
            className="group flex-shrink-0 w-[220px] sm:w-[260px] md:w-[340px] bg-[#12121a] border border-[#2a2a3a] hover:border-[#f5c542]/30 transition-all overflow-hidden"
          >
            <div className="relative aspect-video bg-[#1a1a26]">
              {ep.still && !failedImages.has(ep.episode) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={ep.still}
                  alt={ep.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                  onError={() => handleImageError(ep.episode)}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a26]">
                  <div className="text-center">
                    <Play className="w-8 h-8 text-[#f5c542]/60 mx-auto mb-1" />
                    <span className="text-[#8e8ea0] text-sm font-medium">E{ep.episode}</span>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                <Play className="w-6 h-6 md:w-8 md:h-8 text-[#f5c542]" fill="#f5c542" />
              </div>
              {ep.runtime ? (
                <span className="absolute bottom-1 right-1 px-1 md:px-1.5 py-0.5 text-[9px] md:text-[10px] bg-black/70 text-white">{ep.runtime}m</span>
              ) : null}
            </div>
            <div className="p-2 md:p-3">
              <p className="text-xs sm:text-sm font-medium text-white truncate">{ep.episode}. {ep.name}</p>
              {ep.overview ? <p className="text-[10px] sm:text-xs text-[#8e8ea0] mt-1 line-clamp-2">{ep.overview}</p> : null}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
