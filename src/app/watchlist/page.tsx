"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bookmark, Trash2 } from "lucide-react";
import { WatchlistItem, getWatchlist, removeFromWatchlist } from "@/lib/watchlist";

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchlistItem[]>([]);

  useEffect(() => {
    setItems(getWatchlist());
  }, []);

  const remove = (slug: string) => {
    removeFromWatchlist(slug);
    setItems((prev) => prev.filter((i) => i.slug !== slug));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] px-4 md:px-8 py-8 max-w-[1800px] mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">My Watchlist</h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Bookmark className="w-16 h-16 text-[#2a2a3a]" />
          <p className="text-[#8e8ea0] text-lg">Your watchlist is empty</p>
          <Link href="/" className="px-6 py-3 bg-[#f5c542] text-[#0a0a0f] font-semibold hover:bg-[#e0b530] transition-colors">
            Browse Content
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {items.map((item) => {
            const href = item.type === "movie"
              ? `/movie/${item.slug}?tmdbId=${item.tmdbId}`
              : `/series/${item.slug}?tmdbId=${item.tmdbId}`;

            return (
              <div key={item.slug} className="relative group">
                <Link href={href} className="block">
                  <div className="relative aspect-[2/3] overflow-hidden bg-[#12121a] rounded-sm">
                    <Image
                      src={item.poster || "https://image.tmdb.org/t/p/w500/placeholder.svg"}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs font-semibold truncate">{item.title}</p>
                      <p className="text-[#8e8ea0] text-[10px]">{item.year}</p>
                    </div>
                  </div>
                </Link>
                <button
                  onClick={() => remove(item.slug)}
                  className="absolute top-2 right-2 w-8 h-8 bg-[#0a0a0f]/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
