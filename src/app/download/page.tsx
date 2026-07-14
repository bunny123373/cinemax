"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Download, Search, Film, Tv } from "lucide-react";
import StreamBoxEmbed from "@/components/StreamBoxEmbed";

function DownloadContent() {
  const searchParams = useSearchParams();
  const tmdbId = searchParams.get("tmdbId");
  const type = searchParams.get("type") || "movie";
  const season = searchParams.get("season");
  const episode = searchParams.get("episode");
  const title = searchParams.get("title") || "";

  const [showStreamBox, setShowStreamBox] = useState(false);
  const [searchType, setSearchType] = useState<"movie" | "series">("movie");
  const [tmdbInput, setTmdbInput] = useState("");
  const [seasonInput, setSeasonInput] = useState("");
  const [episodeInput, setEpisodeInput] = useState("");

  useEffect(() => {
    if (tmdbId) {
      setTmdbInput(tmdbId);
      setSearchType(type as "movie" | "series");
      if (season) setSeasonInput(season);
      if (episode) setEpisodeInput(episode);
      setShowStreamBox(true);
    }
  }, [tmdbId, type, season, episode]);

  if (showStreamBox && tmdbInput) {
    return (
      <StreamBoxEmbed
        type={searchType}
        tmdbId={Number(tmdbInput)}
        season={searchType === "series" && seasonInput ? Number(seasonInput) : undefined}
        episode={searchType === "series" && episodeInput ? Number(episodeInput) : undefined}
        title={title || (searchType === "series" ? `Series #${tmdbInput}` : `Movie #${tmdbInput}`)}
        onClose={() => setShowStreamBox(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] overflow-hidden">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1db954]/10 border border-[#1db954]/20 text-[#1db954] text-xs font-semibold mb-4">
            <Download className="w-3.5 h-3.5" />
            STREAMBOX DOWNLOADS
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">
            Download <span className="text-[#f5c542]">Content</span>
          </h1>
          <p className="text-sm text-[#8e8ea0]">
            Enter a TMDB ID to browse and download movies or series via StreamBox.
          </p>
        </div>

        <div className="bg-[#12121a] border border-[#2a2a3a] p-6 sm:p-8">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setSearchType("movie")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                searchType === "movie"
                  ? "bg-[#f5c542] text-[#0a0a0f]"
                  : "bg-[#1a1a2e] text-[#8e8ea0] hover:text-white"
              }`}
            >
              <Film className="w-4 h-4" />
              Movie
            </button>
            <button
              onClick={() => setSearchType("series")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                searchType === "series"
                  ? "bg-[#f5c542] text-[#0a0a0f]"
                  : "bg-[#1a1a2e] text-[#8e8ea0] hover:text-white"
              }`}
            >
              <Tv className="w-4 h-4" />
              Series
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-[#8e8ea0] mb-1.5">TMDB ID</label>
              <input
                type="text"
                placeholder="e.g. 385687"
                value={tmdbInput}
                onChange={(e) => setTmdbInput(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0a0a0f] border border-[#2a2a3a] text-white text-sm placeholder-[#4a4a5a] focus:border-[#f5c542]/50 focus:outline-none transition-colors"
              />
            </div>
            {searchType === "series" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#8e8ea0] mb-1.5">Season</label>
                  <input
                    type="text"
                    placeholder="1"
                    value={seasonInput}
                    onChange={(e) => setSeasonInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0a0a0f] border border-[#2a2a3a] text-white text-sm placeholder-[#4a4a5a] focus:border-[#f5c542]/50 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8e8ea0] mb-1.5">Episode</label>
                  <input
                    type="text"
                    placeholder="1"
                    value={episodeInput}
                    onChange={(e) => setEpisodeInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0a0a0f] border border-[#2a2a3a] text-white text-sm placeholder-[#4a4a5a] focus:border-[#f5c542]/50 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}
            <button
              onClick={() => tmdbInput && setShowStreamBox(true)}
              disabled={!tmdbInput}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#f5c542] text-[#0a0a0f] text-sm font-bold hover:bg-[#e0b530] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Search className="w-4 h-4" />
              Browse Downloads
            </button>
          </div>
        </div>

        <div className="mt-8 bg-[#12121a] border border-[#2a2a3a] p-6">
          <h2 className="text-sm font-semibold text-white mb-3">Quick Links</h2>
          <p className="text-xs text-[#8e8ea0] mb-4">Common TMDB IDs to try:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {[
              { name: "Oppenheimer", id: "872585", type: "movie" },
              { name: "Dune: Part Two", id: "693134", type: "movie" },
              { name: "Deadpool & Wolverine", id: "533535", type: "movie" },
              { name: "Game of Thrones", id: "1399", type: "series" },
              { name: "Breaking Bad", id: "1396", type: "series" },
              { name: "Stranger Things", id: "66732", type: "series" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setSearchType(item.type as "movie" | "series");
                  setTmdbInput(item.id);
                  if (item.type === "series") {
                    setSeasonInput("1");
                    setEpisodeInput("1");
                  }
                  setShowStreamBox(true);
                }}
                className="text-left px-3 py-2 bg-[#0a0a0f] border border-[#2a2a3a] text-[#8e8ea0] hover:border-[#f5c542]/30 hover:text-white transition-colors"
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DownloadPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
          <div className="animate-spin w-8 h-8 border-2 border-[#f5c542] border-t-transparent" />
        </div>
      }
    >
      <DownloadContent />
    </Suspense>
  );
}
