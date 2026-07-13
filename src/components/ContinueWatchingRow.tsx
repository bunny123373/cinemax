"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { ContinueWatchingItem } from "@/types";
import { getContinueWatching, removeContinueWatching } from "@/lib/storage";

function toSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function ContinueWatchingRow() {
  const [items, setItems] = useState<ContinueWatchingItem[]>([]);
  const rowRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    setItems(getContinueWatching());
  }, []);

  const remove = (slug: string) => {
    removeContinueWatching(slug);
    setItems((prev) => prev.filter((i) => i.slug !== slug));
  };

  const scroll = (direction: "left" | "right") => {
    if (!rowRef.current) return;
    rowRef.current.scrollBy({
      left: direction === "left" ? -rowRef.current.clientWidth : rowRef.current.clientWidth,
      behavior: "smooth",
    });
  };

  if (!items.length) return null;

  return (
    <section className="relative">
      <div className="flex items-center justify-between mb-4 px-4 md:px-8">
        <h2 className="text-xl md:text-2xl font-bold text-white">Continue Watching</h2>
      </div>
      <div
        className="relative"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <button
          onClick={() => scroll("left")}
          className={`absolute left-0 top-0 bottom-0 z-20 w-12 md:w-16 bg-gradient-to-r from-[#0a0a0f] to-transparent flex items-center justify-start pl-2 transition-opacity ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <div
          ref={rowRef}
          className="flex gap-3 overflow-x-auto scroll-smooth px-4 md:px-8 pb-2 scrollbar-hide"
        >
          {items.map((item) => {
            const watchHref = item.type === "movie"
              ? `/watch/${item.slug}?tmdbId=${item.tmdbId || ""}&type=movie`
              : `/series/watch/${item.slug}?tmdbId=${item.tmdbId || ""}&type=tv&season=${item.seasonNumber || 1}&episode=${item.episodeNumber || 1}`;
            const progress = item.duration > 0 ? (item.currentTime / item.duration) * 100 : 0;

            return (
              <div key={`${item.slug}-${item.seasonNumber}-${item.episodeNumber}`} className="flex-shrink-0 w-[100px] sm:w-[120px] md:w-[150px] lg:w-[170px] relative group">
                <Link href={watchHref} className="block">
                  <div className="relative aspect-[2/3] overflow-hidden bg-[#12121a]">
                    <Image
                      src={item.poster || "https://image.tmdb.org/t/p/w500/placeholder.svg"}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 px-2 pb-2">
                      <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mb-1.5">
                        <div
                          className="h-full bg-[#f5c542] rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-white text-xs font-semibold truncate">{item.title}</p>
                      {item.type === "series" && item.seasonNumber && item.episodeNumber && (
                        <p className="text-[#8e8ea0] text-[10px]">S{item.seasonNumber} E{item.episodeNumber}</p>
                      )}
                    </div>
                  </div>
                </Link>
                <button
                  onClick={(e) => { e.preventDefault(); remove(item.slug); }}
                  className="absolute top-1 right-1 w-5 h-5 bg-[#0a0a0f]/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            );
          })}
        </div>
        <button
          onClick={() => scroll("right")}
          className={`absolute right-0 top-0 bottom-0 z-20 w-12 md:w-16 bg-gradient-to-l from-[#0a0a0f] to-transparent flex items-center justify-end pr-2 transition-opacity ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </div>
    </section>
  );
}
