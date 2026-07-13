"use client";

import Link from "next/link";
import Image from "next/image";
import { IContent } from "@/types";
import { Star } from "lucide-react";

interface ContentCardProps {
  item: IContent;
  accentColor?: string;
}

export default function ContentCard({ item, accentColor = "#f5c542" }: ContentCardProps) {
  const href = item.type === "movie"
    ? `/movie/${item.slug}?tmdbId=${item.tmdbId}`
    : `/series/${item.slug}?tmdbId=${item.tmdbId}`;

  return (
    <Link href={href} className="group block relative cursor-pointer transition-all duration-300 ease-out hover:scale-[1.15] hover:z-30">
      <div className="relative aspect-[2/3] overflow-hidden bg-[#12121a] border border-[#2a2a3a]">
        <Image
          src={item.poster || `https://image.tmdb.org/t/p/w500/placeholder.svg`}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {item.quality && (
            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-[#f5c542] text-[#0a0a0f]">
              {item.quality}
            </span>
          )}
        </div>

        {item.rating > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 bg-[#0a0a0f]/80 text-[11px]">
            <Star className="w-3 h-3 fill-[#f5c542] text-[#f5c542]" />
            <span className="text-white font-medium">{item.rating.toFixed(1)}</span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-[#0a0a0f] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="text-white text-sm font-semibold truncate">{item.title}</p>
          <p className="text-[#8e8ea0] text-xs">{item.year}</p>
        </div>
      </div>
    </Link>
  );
}
