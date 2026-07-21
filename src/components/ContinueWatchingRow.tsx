"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, X } from "lucide-react";
import { getContinueWatching, removeContinueWatching } from "@/lib/storage";
import type { ContinueWatchingItem } from "@/types";

export default function ContinueWatchingRow() {
  const [items, setItems] = useState<ContinueWatchingItem[]>([]);

  useEffect(() => {
    setItems(getContinueWatching().slice(0, 12));
  }, []);

  if (items.length === 0) return null;

  function getWatchHref(item: ContinueWatchingItem) {
    if (item.type === "movie") {
      return `/watch/${item.slug}?tmdbId=${item.tmdbId}&t=${item.currentTime}`;
    }
    const se = item.seasonNumber || 1;
    const ep = item.episodeNumber || 1;
    return `/series/watch/${item.slug}?tmdbId=${item.tmdbId}&type=tv&season=${se}&episode=${ep}&t=${item.currentTime}`;
  }

  function getDetailHref(item: ContinueWatchingItem) {
    return item.type === "movie"
      ? `/movie/${item.slug}?tmdbId=${item.tmdbId}`
      : `/series/${item.slug}?tmdbId=${item.tmdbId}`;
  }

  function remove(slug: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    removeContinueWatching(slug);
    setItems((prev) => prev.filter((i) => i.slug !== slug));
  }

  return (
    <section className="relative overflow-hidden">
      <div className="flex items-center justify-between mb-4 px-4 md:px-8">
        <h2 className="text-xl md:text-2xl font-bold text-white">Continue Watching</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 md:px-8 pb-4">
        {items.map((item) => {
          const progress = item.duration > 0 ? Math.min((item.currentTime / item.duration) * 100, 100) : 0;
          const remaining = item.duration - item.currentTime;
          const mins = Math.floor(remaining / 60);

          return (
            <Link
              key={`${item.slug}-${item.seasonNumber}-${item.episodeNumber}`}
              href={getWatchHref(item)}
              className="relative flex-shrink-0 w-[140px] md:w-[180px] group"
            >
              <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
                <Image
                  src={item.poster || "https://image.tmdb.org/t/p/w500/placeholder.svg"}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="180px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 rounded-full bg-[#f5c542] flex items-center justify-center shadow-lg">
                    <Play className="w-5 h-5 text-[#0a0a0f] fill-[#0a0a0f] ml-0.5" />
                  </div>
                </div>

                <button
                  onClick={(e) => remove(item.slug, e)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                >
                  <X className="w-3 h-3 text-white" />
                </button>

                <div className="absolute bottom-0 left-0 right-0 px-2 pb-2">
                  <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#f5c542] rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-white/60 mt-1 text-right">{mins}m left</p>
                </div>
              </div>

              <div className="mt-2 px-0.5">
                <p className="text-xs text-white font-medium truncate">{item.title}</p>
                {item.type === "series" && item.seasonNumber && item.episodeNumber && (
                  <p className="text-[10px] text-[#8e8ea0]">
                    S{item.seasonNumber} E{item.episodeNumber}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
