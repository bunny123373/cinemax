"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { IContent } from "@/types";
import { Star, Play, Plus, ChevronDown } from "lucide-react";

interface ContentCardProps {
  item: IContent;
}

export default function ContentCard({ item }: ContentCardProps) {
  const [hovered, setHovered] = useState(false);
  const closeTimeout = useRef<ReturnType<typeof setTimeout>>(null);
  const href = item.type === "movie"
    ? `/movie/${item.slug}?tmdbId=${item.tmdbId}`
    : `/series/${item.slug}?tmdbId=${item.tmdbId}`;
  const watchHref = item.type === "movie"
    ? `/watch/${item.slug}?tmdbId=${item.tmdbId}&type=movie`
    : `/series/watch/${item.slug}?tmdbId=${item.tmdbId}&type=tv&season=1&episode=1`;

  const handleEnter = useCallback(() => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setHovered(true);
  }, []);

  const handleLeave = useCallback(() => {
    closeTimeout.current = setTimeout(() => setHovered(false), 200);
  }, []);

  return (
    <div
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <Link href={href} className="block relative cursor-pointer">
        <div className="relative aspect-[2/3] overflow-hidden transition-all duration-300 ease-out">
          <Image
            src={item.poster || `https://image.tmdb.org/t/p/w500/placeholder.svg`}
            alt={item.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
          />
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {item.quality && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-white text-black">
                {item.quality}
              </span>
            )}
          </div>
        </div>
      </Link>

      {hovered && (
        <div
          className="absolute left-1/2 -translate-x-1/2 top-0 z-50 w-[240px] md:w-[280px] pointer-events-auto animate-popup hidden sm:block"
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        >
          <div className="bg-[#18181f] overflow-hidden shadow-[0_10px_60px_rgba(0,0,0,0.8)] border border-white/10">
            <Link href={href} className="block relative aspect-video overflow-hidden">
              <Image
                src={item.banner || item.poster || ""}
                alt={item.title}
                fill
                className="object-cover"
                sizes="280px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#18181f] via-transparent to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                <Link href={watchHref} className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:bg-white transition-colors">
                  <Play className="w-5 h-5 text-black fill-black ml-0.5" />
                </Link>
              </div>
            </Link>

            <div className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Link href={watchHref} className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0 hover:bg-white/80 transition-colors">
                  <Play className="w-4 h-4 text-black fill-black ml-0.5" />
                </Link>
                <button className="w-8 h-8 rounded-full border-2 border-[#424242] flex items-center justify-center hover:border-white transition-colors">
                  <Plus className="w-4 h-4 text-white" />
                </button>
                <button className="w-8 h-8 rounded-full border-2 border-[#424242] flex items-center justify-center hover:border-white transition-colors ml-auto">
                  <ChevronDown className="w-4 h-4 text-white" />
                </button>
              </div>

              <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                {item.rating > 0 && (
                  <span className="text-[#46d369] text-xs font-semibold flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-[#46d369]" />
                    {item.rating.toFixed(1)}
                  </span>
                )}
                <span className="text-white/60 text-xs">{item.year}</span>
                <span className="px-1 py-0.5 text-[9px] border border-white/30 text-white/60 rounded">HD</span>
                <span className="px-1 py-0.5 text-[9px] border border-white/30 text-white/60 rounded capitalize">{item.type}</span>
              </div>

              <p className="text-white/50 text-[11px] line-clamp-2">{item.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
