"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Star, Play, Globe, RefreshCw } from "lucide-react";
import ContentRow from "@/components/ContentRow";
import WatchlistButton from "@/components/WatchlistButton";
import DownloadGate from "@/components/DownloadGate";
import StreamBoxEmbed from "@/components/StreamBoxEmbed";
import AdBanner from "@/components/AdBanner";
import { getContinueWatching } from "@/lib/storage";
import type { Net27TitleDetail, Net27Item } from "@/types/net27";

function toSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

interface Variant {
  dubSubjectId: string;
  language: string;
  isOriginal: boolean;
}

interface MovieDetailProps {
  item: Net27Item;
  detail: Net27TitleDetail | null;
  related: Net27Item[];
}

export default function MovieDetail({ item, detail, related }: MovieDetailProps) {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedDub, setSelectedDub] = useState<string>("");
  const [resumeFrom, setResumeFrom] = useState<number | null>(null);
  const [showDownloadGate, setShowDownloadGate] = useState(false);
  const [showStreamBox, setShowStreamBox] = useState(false);

  useEffect(() => {
    fetch(`/api/net27/variants/movie/${item.tmdbId}`)
      .then((r) => r.json())
      .then((res) => { if (res.variants && res.variants.length > 0) setVariants(res.variants); })
      .catch(() => {});
  }, [item.tmdbId]);

  useEffect(() => {
    const cw = getContinueWatching();
    const existing = cw.find((i) => i.slug === toSlug(item.title) && i.type === "movie");
    if (existing && existing.currentTime > 30 && existing.currentTime < existing.duration * 0.95) {
      setResumeFrom(Math.floor(existing.currentTime));
    }
  }, [item.title]);

  const dubParam = selectedDub ? `&dub=${selectedDub}` : "";
  const watchHref = `/watch/${toSlug(item.title)}?tmdbId=${item.tmdbId}&type=movie${dubParam}`;
  const resumeHref = resumeFrom ? `${watchHref}&t=${resumeFrom}` : watchHref;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Movie",
          name: item.title,
          image: item.poster || undefined,
          dateCreated: item.year ? `${item.year}` : undefined,
          aggregateRating: item.rating > 0 ? { "@type": "AggregateRating", ratingValue: item.rating, bestRating: 10 } : undefined,
          duration: detail?.runtime ? `PT${detail.runtime}M` : undefined,
          description: detail?.overview || undefined,
          genre: detail?.genres?.map((g: any) => g.name || g) || undefined,
        })}}
      />
      <div className="relative w-full h-[40vh] min-h-[260px] sm:h-[50vh] md:h-[60vh] lg:h-[70vh]">
        <Image
          src={item.backdrop || item.poster || ""}
          alt={item.title}
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/30 to-transparent" />
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 -mt-24 sm:-mt-32 md:-mt-44 lg:-mt-52">
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-8 items-start">
          <div className="w-28 sm:w-36 md:w-48 shrink-0 mx-auto md:mx-0">
            <div className="relative aspect-[2/3] overflow-hidden bg-[#12121a] shadow-2xl">
              <Image
                src={item.poster || ""}
                alt={item.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 112px, 192px"
              />
            </div>
          </div>

          <div className="flex-1 pt-2 md:pt-12 pb-6 md:pb-8 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 md:gap-3 mb-2 md:mb-3">
              <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold bg-[#f5c542] text-[#0a0a0f]">
                Movie
              </span>
              <span className="text-xs sm:text-sm text-[#8e8ea0]">{item.year}</span>
              {item.rating > 0 && (
                <span className="flex items-center gap-1 text-xs sm:text-sm text-[#46d369]">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-[#46d369]" />
                  {item.rating.toFixed(1)}
                </span>
              )}
              {detail?.runtime && (
                <span className="text-xs sm:text-sm text-[#8e8ea0]">{detail.runtime} min</span>
              )}
              {detail?.certification?.rating && (
                <span className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs bg-[#2a2a3a] text-white">{detail.certification.rating}</span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-2">{item.title}</h1>

            {detail?.cast && detail.cast.length > 0 && (
              <div className="mb-3 md:mb-4">
                <p className="text-[10px] sm:text-xs text-[#8e8ea0] mb-1.5 font-medium">Cast</p>
                <div className="flex gap-2 sm:gap-2.5 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                  {detail.cast.slice(0, 10).map((actor, idx) => (
                    <div key={idx} className="flex-shrink-0 text-center w-14 sm:w-16 md:w-20">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 mx-auto rounded-full overflow-hidden bg-[#2a2a3a] mb-1">
                        {actor.photo ? (
                          <Image
                            src={actor.photo}
                            alt={actor.name}
                            width={56}
                            height={56}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#8e8ea0] text-[10px] sm:text-xs">
                            {actor.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <p className="text-[8px] sm:text-[10px] text-white font-medium truncate">{actor.name}</p>
                      <p className="text-[7px] sm:text-[9px] text-[#8e8ea0] truncate">{actor.character}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {detail?.tagline && (
              <p className="text-xs sm:text-sm italic text-[#8e8ea0] mb-3 md:mb-4">&quot;{detail.tagline}&quot;</p>
            )}

            {detail?.genres && detail.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 md:mb-6">
                {detail.genres.map((g) => (
                  <span key={g.name} className="px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs bg-[#1a1a2e] text-[#8e8ea0]">{g.name}</span>
                ))}
              </div>
            )}

            <p className="text-xs sm:text-sm md:text-base text-[#8e8ea0] leading-relaxed mb-4 md:mb-6 max-w-3xl line-clamp-4 md:line-clamp-6">
              {item.overview}
            </p>

            <div className="flex flex-wrap items-center gap-3 md:gap-4">
              <Link
                href={resumeFrom ? resumeHref : watchHref}
                className="inline-flex items-center gap-2 px-5 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 bg-[#f5c542] text-[#0a0a0f] text-sm sm:text-base font-semibold hover:bg-[#e0b530] transition-colors"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5" fill="#0a0a0f" />
                {resumeFrom ? "Resume" : "Watch Now"}
              </Link>
              {resumeFrom && (
                <Link
                  href={watchHref}
                  className="inline-flex items-center gap-2 px-4 py-2 sm:py-2.5 border border-[#2a2a3a] text-[#8e8ea0] text-sm hover:text-white hover:border-[#f5c542]/30 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Restart
                </Link>
              )}
              <button
                onClick={() => setShowDownloadGate(true)}
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-2 sm:py-2.5 bg-[#f5c542] text-[#0a0a0f] text-sm sm:text-base font-semibold hover:bg-[#e0b530] transition-colors"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download
              </button>
              <WatchlistButton
                slug={toSlug(item.title)}
                tmdbId={item.tmdbId}
                type="movie"
                title={item.title}
                poster={item.poster || ""}
                year={parseInt(item.year) || 0}
                rating={item.rating}
              />
            </div>

            {variants.length > 0 && (
              <div className="mt-4 md:mt-5">
                <p className="text-[10px] sm:text-xs text-[#8e8ea0] mb-2 font-medium flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  Audio
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedDub("")}
                    className={`px-3 py-1.5 text-xs font-medium border transition-colors ${
                      !selectedDub
                        ? "border-[#f5c542] text-[#f5c542] bg-[#f5c542]/10"
                        : "border-[#2a2a3a] text-[#8e8ea0] hover:border-[#f5c542]/30 hover:text-white"
                    }`}
                  >
                    Original
                  </button>
                  {variants.map((v) => (
                    <button
                      key={v.dubSubjectId}
                      onClick={() => setSelectedDub(v.dubSubjectId)}
                      className={`px-3 py-1.5 text-xs font-medium border transition-colors ${
                        selectedDub === v.dubSubjectId
                          ? "border-[#f5c542] text-[#f5c542] bg-[#f5c542]/10"
                          : "border-[#2a2a3a] text-[#8e8ea0] hover:border-[#f5c542]/30 hover:text-white"
                      }`}
                    >
                      {v.language}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <a
        href="https://t.me/MultiMirror"
        target="_blank"
        rel="noopener noreferrer"
        className="block max-w-[1800px] mx-auto px-4 sm:px-6 mt-8 md:mt-12"
      >
        <div className="bg-gradient-to-r from-[#2CA5E0]/10 to-[#12121a] border border-[#2CA5E0]/20 rounded-xl p-4 hover:border-[#2CA5E0]/50 transition-colors group">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#2CA5E0]/10 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-[#2CA5E0]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white group-hover:text-[#2CA5E0] transition-colors">Join Telegram for Updates</p>
                <p className="text-xs text-[#8e8ea0]">New movies & series added daily</p>
              </div>
            </div>
            <span className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-[#2CA5E0]/10 border border-[#2CA5E0]/30 text-[#2CA5E0] rounded-lg whitespace-nowrap">
              Join
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </span>
          </div>
        </div>
      </a>

      <AdBanner />

      {related && related.length > 0 && (
        <div className="mt-12 md:mt-16 pb-12 md:pb-16 px-4 sm:px-6 max-w-[1800px] mx-auto">
          <ContentRow
            title="More Like This"
            items={related.map((r) => ({
              _id: String(r.tmdbId),
              tmdbId: r.tmdbId,
              type: r.type as "movie" | "series",
              title: r.title,
              slug: toSlug(r.title),
              poster: r.poster || "",
              banner: r.backdrop || "",
              description: r.overview,
              year: parseInt(r.year) || 0,
              language: "en",
              category: r.type,
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

      {showStreamBox && (
        <StreamBoxEmbed
          type="movie"
          tmdbId={item.tmdbId}
          title={item.title}
          onClose={() => setShowStreamBox(false)}
        />
      )}

      <DownloadGate
        open={showDownloadGate}
        onClose={() => setShowDownloadGate(false)}
        onVerified={() => setShowStreamBox(true)}
      />
    </div>
  );
}
