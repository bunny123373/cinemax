"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, ChevronRight } from "lucide-react";
import type { Net27Item } from "@/types/net27";

interface HeroSliderProps {
  items: Net27Item[];
}

function toSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function HeroSlider({ items }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const slides = items.slice(0, 5);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [paused, next, slides.length]);

  if (!slides.length) return null;
  const item = slides[current];

  return (
    <section
      className="relative w-full h-[35vh] sm:h-[45vh] md:h-[60vh] lg:h-[70vh]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((slide, i) => (
        <div
          key={slide.tmdbId}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            i === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <Image
            src={slide.backdrop || slide.poster || ""}
            alt={slide.title}
            fill
            className="object-cover object-center"
            priority={i === 0}
            sizes="100vw"
          />
        </div>
      ))}

      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/40 to-transparent z-20" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/60 to-transparent z-20" />

      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-16 max-w-[1800px] mx-auto z-30">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2 py-1 text-xs font-bold bg-[#f5c542] text-[#0a0a0f]">HD</span>
            <span className="text-sm text-[#8e8ea0] capitalize">{item.type}</span>
            {item.rating > 0 && (
              <span className="text-sm text-[#f5c542]">★ {item.rating.toFixed(1)}</span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-2 transition-all duration-500">
            {item.title}
          </h1>
          {item.overview && (
            <p className="text-sm text-[#8e8ea0] mb-4 line-clamp-3 max-w-xl">{item.overview}</p>
          )}
          <div className="flex items-center gap-4">
            <Link
              href={item.type === "movie"
                ? `/watch/${toSlug(item.title)}?tmdbId=${item.tmdbId}&type=movie`
                : `/series/watch/${toSlug(item.title)}?tmdbId=${item.tmdbId}&type=tv&season=1&episode=1`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#f5c542] text-[#0a0a0f] font-semibold hover:bg-[#e0b530] transition-colors"
            >
              <Play className="w-5 h-5" fill="#0a0a0f" />
              Watch Now
            </Link>
            <Link
              href={item.type === "movie"
                ? `/movie/${toSlug(item.title)}?tmdbId=${item.tmdbId}`
                : `/series/${toSlug(item.title)}?tmdbId=${item.tmdbId}`}
              className="inline-flex items-center gap-2 px-6 py-3 border border-[#2a2a3a] text-white font-medium hover:bg-white/5 transition-colors"
            >
              More Info
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1 rounded-full transition-all duration-500 ${
              i === current ? "w-8 bg-[#f5c542]" : "w-2 bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
