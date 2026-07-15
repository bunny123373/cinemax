"use client";

import { useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play, Plus, ChevronDown, Star } from "lucide-react";
import { IContent } from "@/types";
import DetailPopup from "./DetailPopup";

interface TopTenRowProps {
  title: string;
  items: IContent[];
  link?: string;
}

function toSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function TopTenCard({ item, index }: { item: IContent; index: number }) {
  const [hovered, setHovered] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const closeTimeout = useRef<ReturnType<typeof setTimeout>>(null);
  const href = item.type === "movie"
    ? `/movie/${toSlug(item.title)}?tmdbId=${item.tmdbId}`
    : `/series/${toSlug(item.title)}?tmdbId=${item.tmdbId}`;
  const watchHref = item.type === "movie"
    ? `/watch/${toSlug(item.title)}?tmdbId=${item.tmdbId}&type=movie`
    : `/series/watch/${toSlug(item.title)}?tmdbId=${item.tmdbId}&type=tv&season=1&episode=1`;

  const handleEnter = useCallback(() => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setHovered(true);
  }, []);

  const handleLeave = useCallback(() => {
    closeTimeout.current = setTimeout(() => setHovered(false), 200);
  }, []);

  return (
    <div
      className="flex-shrink-0 flex items-end relative mr-4 md:mr-6 lg:mr-8"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <span
        className="text-[100px] sm:text-[130px] md:text-[170px] lg:text-[210px] font-black leading-none text-transparent select-none relative z-10 transition-all duration-300"
        style={{
          WebkitTextStroke: "2px #3a3a4a",
          WebkitTextFillColor: "transparent",
        }}
      >
        {index + 1}
      </span>
      <div className="relative bottom-0 w-[100px] sm:w-[120px] md:w-[150px] lg:w-[170px] z-20">
        <Link href={href} className="block">
          <div className="relative aspect-[2/3] overflow-hidden transition-all duration-300 ease-out">
            <Image
              src={item.poster || `https://image.tmdb.org/t/p/w500/placeholder.svg`}
              alt={item.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
            />
          </div>
        </Link>

        {hovered && (
          <div
            className="absolute left-1/2 -translate-x-1/2 top-0 z-50 w-[240px] md:w-[280px] pointer-events-auto animate-popup hidden sm:block"
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
          >
            <div className="bg-[#18181f] overflow-hidden shadow-[0_10px_60px_rgba(0,0,0,0.8)] border border-white/10 animate-popup">
              <Link href={href} className="block relative aspect-video overflow-hidden">
                <Image
                  src={item.banner || item.poster || ""}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="280px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#18181f] via-transparent to-transparent" />
              </Link>

              <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Link href={watchHref} className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0 hover:bg-white/80 transition-colors">
                    <Play className="w-4 h-4 text-black fill-black ml-0.5" />
                  </Link>
                  <button
                    className="w-8 h-8 rounded-full border-2 border-[#424242] flex items-center justify-center hover:border-white transition-colors"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowDetail(true); setHovered(false); }}
                  >
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                  <button
                    className="w-8 h-8 rounded-full border-2 border-[#424242] flex items-center justify-center hover:border-white transition-colors ml-auto"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowDetail(true); setHovered(false); }}
                  >
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

      {showDetail && (
        <DetailPopup
          tmdbId={item.tmdbId}
          type={item.type}
          title={item.title}
          slug={toSlug(item.title)}
          onClose={() => setShowDetail(false)}
        />
      )}
    </div>
  );
}

export default function TopTenRow({ title, items, link }: TopTenRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const top10 = items.slice(0, 10);

  const scroll = (direction: "left" | "right") => {
    if (!rowRef.current) return;
    const scrollAmount = rowRef.current.clientWidth;
    rowRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (!top10.length) return null;

  return (
    <section className="relative overflow-hidden">
      <div className="flex items-center justify-between mb-4 px-4 md:px-8">
        <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
        {link && (
          <Link
            href={link}
            className="text-sm text-[#f5c542] hover:text-[#e0b530] transition-colors"
          >
            View All
          </Link>
        )}
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
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <div
          ref={rowRef}
          className="flex overflow-x-auto px-4 md:px-8 pb-10 pt-4 scrollbar-hide -my-4"
        >
          {top10.map((item, index) => (
            <TopTenCard key={item.slug} item={item} index={index} />
          ))}
        </div>
        <button
          onClick={() => scroll("right")}
          className={`absolute right-0 top-0 bottom-0 z-20 w-12 md:w-16 bg-gradient-to-l from-[#0a0a0f] to-transparent flex items-center justify-end pr-2 transition-opacity ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </div>
    </section>
  );
}
