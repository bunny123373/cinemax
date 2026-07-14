"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Play, Star, Plus, Check } from "lucide-react";
import type { Net27TitleDetail } from "@/types/net27";

type DetailData = Pick<Net27TitleDetail, "title" | "overview" | "poster" | "backdrop" | "year" | "rating" | "genres" | "runtime">;

interface DetailPopupProps {
  tmdbId: number;
  type: string;
  title: string;
  slug: string;
  onClose: () => void;
}

export default function DetailPopup({ tmdbId, type, title, slug, onClose }: DetailPopupProps) {
  const [detail, setDetail] = useState<DetailData | null>(null);
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
            title: res.embed.title || title,
            overview: res.embed.overview || "",
            poster: res.embed.poster || "",
            backdrop: res.embed.backdrop || "",
            year: res.embed.year || "",
            rating: res.embed.rating || 0,
            genres: res.embed.genres || [],
            runtime: res.embed.runtime || 0,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tmdbId, type, title]);

  const item = detail;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-[90%] max-w-[500px] bg-[#18181f] overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.9)] border border-white/10 animate-popup"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-video overflow-hidden">
          {loading ? (
            <div className="absolute inset-0 bg-[#12121a] flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-[#f5c542] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <Image
                src={item?.backdrop || item?.poster || ""}
                alt={item?.title || title}
                fill
                className="object-cover"
                sizes="500px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#18181f] via-[#18181f]/20 to-transparent" />
            </>
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#18181f]/80 flex items-center justify-center text-white hover:bg-[#18181f] transition-colors z-10"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-3 left-4 flex items-center gap-2 z-10">
            <Link
              href={watchHref}
              className="flex items-center gap-1.5 px-4 py-2 bg-white text-black text-sm font-semibold hover:bg-white/80 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Play className="w-4 h-4 fill-black" />
              Play
            </Link>
            <button className="w-8 h-8 rounded-full border-2 border-[#424242] flex items-center justify-center hover:border-white transition-colors">
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {item?.rating !== undefined && item.rating > 0 && (
              <span className="flex items-center gap-1 text-sm text-[#46d369] font-semibold">
                <Star className="w-3.5 h-3.5 fill-[#46d369]" />
                {item.rating.toFixed(1)}
              </span>
            )}
            {item?.year && <span className="text-sm text-white/60">{item.year}</span>}
            <span className="px-1.5 py-0.5 text-[10px] border border-white/30 text-white/60">HD</span>
            <span className="px-1.5 py-0.5 text-[10px] border border-white/30 text-white/60 capitalize">{type}</span>
          </div>

          {item?.overview && (
            <p className="text-sm text-white/50 line-clamp-3 mb-3">{item.overview}</p>
          )}

          {item?.genres && item.genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {item.genres.map((g: { id?: number; name: string }) => (
                <span key={g.name} className="px-2 py-0.5 text-[10px] bg-[#2a2a3a] text-white/60">{g.name}</span>
              ))}
            </div>
          )}

          <Link
            href={href}
            className="inline-flex items-center gap-1.5 text-sm text-[#8e8ea0] hover:text-white transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            Details & Episodes
            <span className="text-xs">&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
