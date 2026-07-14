"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Play, Star } from "lucide-react";
import type { Net27TitleDetail } from "@/types/net27";

interface DetailPopupProps {
  tmdbId: number;
  type: string;
  title: string;
  slug: string;
  onClose: () => void;
}

function toSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function DetailPopup({ tmdbId, type, slug, onClose }: DetailPopupProps) {
  const [detail, setDetail] = useState<Net27TitleDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const href = type === "movie"
    ? `/movie/${slug}?tmdbId=${tmdbId}`
    : `/series/${slug}?tmdbId=${tmdbId}`;
  const watchHref = type === "movie"
    ? `/watch/${slug}?tmdbId=${tmdbId}&type=movie`
    : `/series/watch/${slug}?tmdbId=${tmdbId}&type=tv&season=1&episode=1`;

  useEffect(() => {
    fetch(`/api/net27/embed/${tmdbId}?type=${type === "series" ? "tv" : "movie"}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.ok && res.embed) {
          setDetail({
            title: res.embed.title || "",
            type: type,
            overview: res.embed.overview || "",
            poster: res.embed.poster || "",
            backdrop: res.embed.backdrop || "",
            year: res.embed.year || "",
            rating: res.embed.rating || 0,
            runtime: res.embed.runtime || 0,
            tagline: null,
            genres: res.embed.genres || [],
            cast: [],
            seasons: [],
            initialSeason: 1,
            initialEpisodes: [],
            recommendations: [],
            trailerKey: null,
            certification: null,
            catalog: null,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tmdbId, type]);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-[90%] max-w-[480px] bg-[#18181f] overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.9)] border border-white/10 animate-popup flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-[#f5c542] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !detail ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <p className="text-[#8e8ea0] text-sm">Details not available</p>
            <Link href={href} className="px-4 py-2 bg-[#f5c542] text-[#0a0a0f] text-sm font-semibold hover:bg-[#e0b530] transition-colors">
              Go to Page
            </Link>
          </div>
        ) : (
          <>
            <div className="relative flex-shrink-0">
              <div className="relative w-full h-[180px] sm:h-[200px] overflow-hidden">
                <Image
                  src={detail.backdrop || detail.poster || ""}
                  alt={detail.title}
                  fill
                  className="object-cover"
                  sizes="1000px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/60 to-transparent" />
              </div>

              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#0a0a0f]/80 flex items-center justify-center text-white hover:bg-[#0a0a0f] transition-colors z-20"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                <div className="flex flex-col sm:flex-row gap-3 items-start">
                  <div className="w-16 sm:w-20 shrink-0 mx-auto sm:mx-0">
                    <div className="relative aspect-[2/3] overflow-hidden bg-[#12121a] shadow-2xl">
                      <Image
                        src={detail.poster || ""}
                        alt={detail.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h1 className="text-base sm:text-lg font-bold text-white mb-1.5">{detail.title}</h1>

                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                      {detail.rating > 0 && (
                        <span className="flex items-center gap-1 text-sm text-[#46d369] font-semibold">
                          <Star className="w-4 h-4 fill-[#46d369]" />
                          {detail.rating.toFixed(1)}
                        </span>
                      )}
                      {detail.year && <span className="text-sm text-white/60">{detail.year}</span>}
                      {detail.runtime > 0 && <span className="text-sm text-white/60">{detail.runtime} min</span>}
                      <span className="px-1.5 py-0.5 text-[10px] border border-white/30 text-white/60">HD</span>
                    </div>

                    {detail.genres && detail.genres.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {detail.genres.map((g) => (
                          <span key={g.name} className="px-1.5 py-0.5 text-[9px] bg-[#2a2a3a] text-white/60">{g.name}</span>
                        ))}
                      </div>
                    )}

                    {detail.overview && (
                      <p className="text-xs text-white/50 line-clamp-2 mb-3">{detail.overview}</p>
                    )}

                    <div className="flex items-center gap-2">
                      <Link
                        href={watchHref}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-black text-xs font-semibold hover:bg-white/80 transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-black" />
                        Play
                      </Link>
                      <Link
                        href={href}
                        className="inline-flex items-center gap-1.5 px-4 py-2 border border-white/30 text-white text-xs font-medium hover:bg-white/5 transition-colors"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 pt-2">
              {detail.cast && detail.cast.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-sm font-semibold text-white mb-3">Cast</h2>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {detail.cast.slice(0, 8).map((actor, idx) => (
                      <div key={idx} className="flex-shrink-0 text-center w-16">
                        <div className="w-12 h-12 mx-auto rounded-full overflow-hidden bg-[#2a2a3a] mb-1">
                          {actor.photo ? (
                            <Image src={actor.photo} alt={actor.name} width={48} height={48} className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#8e8ea0] text-xs">{actor.name.charAt(0)}</div>
                          )}
                        </div>
                        <p className="text-[9px] text-white truncate">{actor.name}</p>
                        <p className="text-[8px] text-[#8e8ea0] truncate">{actor.character}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {detail.recommendations && detail.recommendations.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold text-white mb-3">More Like This</h2>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {detail.recommendations.slice(0, 6).map((r) => {
                      const rSlug = toSlug(r.title);
                      const rHref = r.type === "movie"
                        ? `/movie/${rSlug}?tmdbId=${r.tmdbId}`
                        : `/series/${rSlug}?tmdbId=${r.tmdbId}`;
                      return (
                        <Link key={r.tmdbId} href={rHref} className="flex-shrink-0 w-[100px]">
                          <div className="relative aspect-[2/3] overflow-hidden bg-[#12121a]">
                            <Image src={r.poster || ""} alt={r.title} fill className="object-cover" sizes="100px" />
                          </div>
                          <p className="text-[9px] text-white mt-1 truncate">{r.title}</p>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
