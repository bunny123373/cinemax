"use client";

import Link from "next/link";
import { useState } from "react";

const GENRES = [
  { id: "28", label: "Action" },
  { id: "35", label: "Comedy" },
  { id: "18", label: "Drama" },
  { id: "27", label: "Horror" },
  { id: "878", label: "Sci-Fi" },
  { id: "53", label: "Thriller" },
  { id: "10749", label: "Romance" },
  { id: "16", label: "Animation" },
  { id: "80", label: "Crime" },
  { id: "12", label: "Adventure" },
  { id: "14", label: "Fantasy" },
  { id: "9648", label: "Mystery" },
  { id: "10751", label: "Family" },
  { id: "99", label: "Documentary" },
];

export default function GenreFilter() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
      {GENRES.map((g) => (
        <Link
          key={g.id}
          href={`/search?type=movie&genre=${g.id}`}
          className="flex-shrink-0 px-4 py-2 text-xs sm:text-sm font-medium bg-[#12121a] border border-[#2a2a3a] text-[#8e8ea0] hover:border-[#f5c542]/50 hover:text-white transition-colors"
        >
          {g.label}
        </Link>
      ))}
    </div>
  );
}
