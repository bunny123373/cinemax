"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Star, Play, Layers, Globe } from "lucide-react";
import ContentRow from "@/components/ContentRow";
import WatchlistButton from "@/components/WatchlistButton";
import SeasonEpisodes from "@/components/SeasonEpisodes";
import type { Net27TitleDetail, Net27Item } from "@/types/net27";

function toSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

interface Variant {
  dubSubjectId: string;
  language: string;
  isOriginal: boolean;
}

interface SeriesDetailProps {
  item: Net27Item;
  detail: Net27TitleDetail | null;
  related: Net27Item[];
}

export default function SeriesDetail({ item, detail, related }: SeriesDetailProps) {
  const initialSeason = detail?.initialSeason || 1;
  const [selectedDub, setSelectedDub] = useState<string>("");
  const [variants, setVariants] = useState<Variant[]>([]);

  const dubParam = selectedDub ? `&dub=${selectedDub}` : "";
  const firstEpHref = `/series/watch/${toSlug(item.title)}?tmdbId=${item.tmdbId}&type=tv&season=${initialSeason}&episode=1${dubParam}`;

  useEffect(() => {
    fetch(`/api/net27/variants/tv/${item.tmdbId}?se=${initialSeason}&ep=1`)
      .then((r) => r.json())
      .then((res) => { if (res.variants && res.variants.length > 0) setVariants(res.variants); })
      .catch(() => {});
  }, [item.tmdbId, initialSeason]);

  return (
    <main className="min-h-screen pb-20">
      <div className="relative w-full h-[40vh] min-h-[260px] sm:h-[50vh] md:h-[60vh] lg:h-[70vh] group/banner">
        <Image
          src={item.backdrop || item.poster || ""}
          alt={item.title}
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/40 to-transparent" />
        <Link
          href={firstEpHref}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/banner:opacity-100 transition-opacity duration-500 z-10"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-[#f5c542]/90 flex items-center justify-center shadow-2xl shadow-[#f5c542]/40 hover:bg-[#f5c542] transition-colors">
            <Play className="w-6 h-6 sm:w-8 sm:h-8 text-[#0a0a0f] ml-1" fill="#0a0a0f" />
          </div>
        </Link>
      </div>

      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 -mt-24 sm:-mt-32 md:-mt-44 lg:-mt-52 relative z-10">
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-10 items-start">
          <div className="flex-shrink-0 w-28 sm:w-40 md:w-56 lg:w-64 mx-auto md:mx-0">
            <div className="relative aspect-[2/3] overflow-hidden bg-[#12121a] shadow-2xl">
              <Image
                src={item.poster || ""}
                alt={item.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 112px, (max-width: 1024px) 160px, 256px"
              />
            </div>
          </div>

          <div className="flex-1 pt-2 md:pt-16 min-w-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 md:mb-3">
              {detail?.certification?.rating && (
                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold bg-[#2a2a3a] text-[#f5c542]">
                  {detail.certification.rating}
                </span>
              )}
              <span className="px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold bg-[#f5c542] text-[#0a0a0f]">
                Series
              </span>
              {item.rating > 0 && (
                <span className="flex items-center gap-1 text-xs sm:text-sm text-[#f5c542]">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                  {item.rating.toFixed(1)}
                </span>
              )}
              {detail?.seasons && (
                <span className="flex items-center gap-1 text-xs sm:text-sm text-[#8e8ea0]">
                  <Layers className="w-3 h-3 sm:w-4 sm:h-4" />
                  {detail.seasons.length} {detail.seasons.length === 1 ? "Season" : "Seasons"}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-2 md:mb-4">
              {item.title}
            </h1>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-[#8e8ea0] mb-4 md:mb-6">
              <span>{item.year}</span>
              {detail?.runtime && <span>{detail.runtime} min/ep</span>}
              {detail?.genres && detail.genres.length > 0 && (
                <span className="flex flex-wrap gap-1 sm:gap-2">
                  {detail.genres.map((g) => (
                    <span key={g.name} className="px-1.5 sm:px-2 py-0.5 bg-[#2a2a3a] text-[10px] sm:text-xs">{g.name}</span>
                  ))}
                </span>
              )}
            </div>

            {detail?.tagline && (
              <p className="text-xs sm:text-sm italic text-[#8e8ea0] mb-2 md:mb-3">&quot;{detail.tagline}&quot;</p>
            )}

            <p className="text-xs sm:text-sm md:text-base text-[#8e8ea0] leading-relaxed mb-4 md:mb-6 max-w-3xl line-clamp-4 md:line-clamp-none">
              {item.overview}
            </p>

            <div className="flex flex-wrap items-center gap-3 md:gap-4">
              <Link
                href={firstEpHref}
                className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-[#f5c542] text-[#0a0a0f] text-sm sm:text-base font-semibold hover:bg-[#e0b530] transition-colors"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5" fill="#0a0a0f" />
                Start Watching
              </Link>
              <WatchlistButton
                slug={toSlug(item.title)}
                tmdbId={item.tmdbId}
                type="series"
                title={item.title}
                poster={item.poster || ""}
                year={parseInt(item.year) || 0}
                rating={item.rating}
              />
            </div>

            {variants.length > 0 && (
              <div className="mt-4 md:mt-5">
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="w-3.5 h-3.5 text-[#8e8ea0]" />
                  <span className="text-xs text-[#8e8ea0] font-medium">Audio & Subtitles</span>
                </div>
                <div className="flex gap-0 overflow-x-auto scrollbar-hide pb-0 -mx-1 px-1 border-b border-[#2a2a3a]">
                  {variants.map((v) => (
                    <button
                      key={v.dubSubjectId}
                      onClick={() => setSelectedDub(v.dubSubjectId === selectedDub ? "" : v.dubSubjectId)}
                      className={`flex-shrink-0 px-4 py-2.5 text-xs font-medium transition-colors whitespace-nowrap border-b-2 -mb-[1px] ${
                        selectedDub === v.dubSubjectId
                          ? "border-[#f5c542] text-[#f5c542]"
                          : "border-transparent text-[#8e8ea0] hover:text-white"
                      }`}
                    >
                      {v.language}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {detail?.cast && detail.cast.length > 0 && (
              <div className="mt-6 md:mt-8">
                <h2 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4">Cast</h2>
                <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {detail.cast.slice(0, 10).map((actor, idx) => (
                    <div key={idx} className="flex-shrink-0 text-center w-16 sm:w-20 md:w-24">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto rounded-full overflow-hidden bg-[#2a2a3a] mb-1 md:mb-2">
                        {actor.photo ? (
                          <Image
                            src={actor.photo}
                            alt={actor.name}
                            width={64}
                            height={64}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#8e8ea0] text-xs">
                            {actor.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <p className="text-[9px] sm:text-[10px] text-white font-medium truncate">{actor.name}</p>
                      <p className="text-[8px] sm:text-[9px] text-[#8e8ea0] truncate">{actor.character}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {detail?.seasons && detail.seasons.length > 0 && (
          <SeasonEpisodes
            seasons={detail.seasons}
            initialSeason={initialSeason}
            initialEpisodes={detail.initialEpisodes || []}
            tmdbId={item.tmdbId}
            type="tv"
            titleSlug={toSlug(item.title)}
          />
        )}

        {related && related.length > 0 && (
          <div className="mt-12 md:mt-16">
            <ContentRow
              title="Related Series"
              items={related.map((r) => ({
                _id: String(r.tmdbId),
                tmdbId: r.tmdbId,
                type: "series" as const,
                title: r.title,
                slug: toSlug(r.title),
                poster: r.poster || "",
                banner: r.backdrop || "",
                description: r.overview,
                year: parseInt(r.year) || 0,
                language: "en",
                category: "series",
                quality: "HD",
                rating: r.rating,
                contentRating: "",
                tags: [],
                cast: [],
                trailerEmbedUrl: "",
                hlsLink: "",
                embedIframeLink: "",
                peachifyId: "",
                downloadLink: "",
                netmirrorId: "",
                streams: [],
                createdAt: new Date().toISOString(),
              }))}
            />
          </div>
        )}
      </div>
    </main>
  );
}
