"use client";

import { useState, useEffect } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { addToWatchlist, removeFromWatchlist, isInWatchlist } from "@/lib/watchlist";

interface WatchlistButtonProps {
  slug: string;
  tmdbId: number;
  type: "movie" | "series";
  title: string;
  poster: string;
  year: number;
  rating: number;
}

export default function WatchlistButton({ slug, tmdbId, type, title, poster, year, rating }: WatchlistButtonProps) {
  const [inList, setInList] = useState(false);

  useEffect(() => {
    setInList(isInWatchlist(slug));
  }, [slug]);

  const toggle = () => {
    if (inList) {
      removeFromWatchlist(slug);
      setInList(false);
    } else {
      addToWatchlist({ slug, tmdbId, type, title, poster, year, rating, addedAt: Date.now() });
      setInList(true);
    }
  };

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border transition-colors ${
        inList
          ? "border-[#f5c542] text-[#f5c542] bg-[#f5c542]/10"
          : "border-[#2a2a3a] text-white hover:border-[#f5c542]/50"
      }`}
    >
      {inList ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
      {inList ? "In Watchlist" : "Add to Watchlist"}
    </button>
  );
}
