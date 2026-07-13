"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, ChevronDown } from "lucide-react";

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

export default function SeasonEpisodes({ seasons, initialSeason, initialEpisodes, tmdbId, type, titleSlug }: SeasonEpisodesProps) {
  const [selectedSeason, setSelectedSeason] = useState(initialSeason);
  const [showDropdown, setShowDropdown] = useState(false);

  const currentSeason = seasons.find((s) => s.season_number === selectedSeason);
  const isInitial = selectedSeason === initialSeason;

  return (
    <div className="mt-8 md:mt-12">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-white">Episodes</h2>
        {seasons.length > 1 && (
          <button
            onClick={() => setShowDropdown(true)}
            className="flex items-center gap-2 px-3 py-2 bg-[#12121a] border border-[#2a2a3a] text-white text-sm hover:border-[#f5c542]/50 transition-colors"
          >
            {currentSeason?.name || `Season ${selectedSeason}`}
            <ChevronDown className="w-4 h-4" />
          </button>
        )}
      </div>

      {isInitial && initialEpisodes.length > 0 ? (
        <div className="flex gap-3 md:gap-4 overflow-x-auto scroll-smooth pb-4 scrollbar-hide">
          {initialEpisodes.map((ep) => (
            <Link
              key={ep.episode}
              href={`/series/watch/${titleSlug}?tmdbId=${tmdbId}&type=${type}&season=${selectedSeason}&episode=${ep.episode}`}
              className="group flex-shrink-0 w-[220px] sm:w-[260px] md:w-[340px] bg-[#12121a] border border-[#2a2a3a] hover:border-[#f5c542]/30 transition-all overflow-hidden"
            >
              <div className="relative aspect-video bg-[#1a1a26]">
                {ep.still && (
                  <Image src={ep.still} alt={ep.name} fill className="object-cover" sizes="340px" />
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                  <Play className="w-6 h-6 md:w-8 md:h-8 text-[#f5c542]" fill="#f5c542" />
                </div>
                {ep.runtime && (
                  <span className="absolute bottom-1 right-1 px-1 md:px-1.5 py-0.5 text-[9px] md:text-[10px] bg-black/70 text-white">{ep.runtime}m</span>
                )}
              </div>
              <div className="p-2 md:p-3">
                <p className="text-xs sm:text-sm font-medium text-white truncate">{ep.episode}. {ep.name}</p>
                {ep.overview && <p className="text-[10px] sm:text-xs text-[#8e8ea0] mt-1 line-clamp-2">{ep.overview}</p>}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <Link
          href={`/series/watch/${titleSlug}?tmdbId=${tmdbId}&type=${type}&season=${selectedSeason}&episode=1`}
          className="flex items-center gap-4 p-4 bg-[#12121a] border border-[#2a2a3a] hover:border-[#f5c542]/30 transition-all"
        >
          <div className="w-12 h-12 flex-shrink-0 bg-[#f5c542]/10 flex items-center justify-center">
            <Play className="w-6 h-6 text-[#f5c542]" fill="#f5c542" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Watch {currentSeason?.name || `Season ${selectedSeason}`}</p>
            <p className="text-xs text-[#8e8ea0]">{currentSeason?.episode_count || 0} episodes</p>
          </div>
        </Link>
      )}

      {showDropdown && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowDropdown(false)}>
          <div className="bg-[#18181f] border border-[#2a2a3a] shadow-2xl w-[90%] max-w-[360px] p-1 animate-popup" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a3a]">
              <h3 className="text-sm font-semibold text-white">Select Season</h3>
              <button onClick={() => setShowDropdown(false)} className="text-[#8e8ea0] hover:text-white text-lg leading-none">&times;</button>
            </div>
            <div className="p-2 max-h-[300px] overflow-y-auto scrollbar-hide">
              {seasons.map((s) => (
                <button
                  key={s.season_number}
                  onClick={() => { setSelectedSeason(s.season_number); setShowDropdown(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-[#f5c542]/10 ${s.season_number === selectedSeason ? "text-[#f5c542] bg-[#f5c542]/5" : "text-white"}`}
                >
                  {s.name || `Season ${s.season_number}`}
                  <span className="text-[#8e8ea0] ml-2 text-xs">({s.episode_count} ep)</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
