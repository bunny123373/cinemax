"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Net27Item } from "@/types/net27";

function toSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const PROVIDERS = [
  { id: "netflix", name: "Netflix", color: "#E50914" },
  { id: "netmirror", name: "NetMirror", color: "#FF1744" },
  { id: "anizone", name: "AniZone", color: "#7B2FF2" },
  { id: "animesama", name: "AnimeSama", color: "#FF6B35" },
  { id: "frenchstream", name: "FrenchStream", color: "#1E90FF" },
];

function ContentRow({ title, items, providerId }: { title: string; items: Net27Item[]; providerId: string }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const scroll = (dir: "left" | "right") => {
    if (!rowRef.current) return;
    rowRef.current.scrollBy({
      left: dir === "left" ? -rowRef.current.clientWidth : rowRef.current.clientWidth,
      behavior: "smooth",
    });
  };

  if (!items.length) return null;

  return (
    <section className="relative overflow-hidden">
      <div className="px-4 md:px-8 mb-3">
        <h2 className="text-lg md:text-xl font-bold text-white">{title}</h2>
      </div>
      <div
        className="relative"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <button
          onClick={() => scroll("left")}
          className={`absolute left-0 top-0 bottom-0 z-10 w-12 md:w-16 bg-gradient-to-r from-[#0a0a0f] to-transparent flex items-center justify-start pl-2 transition-opacity ${hovered ? "opacity-100" : "opacity-0"}`}
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <div
          ref={rowRef}
          className="flex gap-2 overflow-x-auto px-4 md:px-8 pb-10 pt-2 scrollbar-hide -my-4"
        >
          {items.map((item) => {
            const slug = toSlug(item.title);
            const href = item.type === "series"
              ? `/series/${slug}?tmdbId=${item.tmdbId}${item.detailPath ? `&dp=${encodeURIComponent(item.detailPath)}` : ""}${providerId !== "netflix" ? `&pid=${providerId}` : ""}`
              : `/movie/${slug}?tmdbId=${item.tmdbId}${item.detailPath ? `&dp=${encodeURIComponent(item.detailPath)}` : ""}${providerId !== "netflix" ? `&pid=${providerId}` : ""}`;
            return (
              <Link key={item.tmdbId} href={href} className="group block flex-shrink-0 w-[130px] sm:w-[150px] md:w-[180px]">
                <div className="relative aspect-[2/3] overflow-hidden rounded-sm bg-[#181818]">
                  <Image
                    src={item.poster || "https://image.tmdb.org/t/p/w500/placeholder.svg"}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 35vw, (max-width: 1024px) 25vw, 18vw"
                  />
                  {item.rating > 0 && (
                    <div className="absolute top-2 left-2">
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-black/70 text-white">★ {item.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <p className="mt-1.5 px-0.5 text-xs text-white font-medium truncate">{item.title}</p>
              </Link>
            );
          })}
        </div>
        <button
          onClick={() => scroll("right")}
          className={`absolute right-0 top-0 bottom-0 z-10 w-12 md:w-16 bg-gradient-to-l from-[#0a0a0f] to-transparent flex items-center justify-end pr-2 transition-opacity ${hovered ? "opacity-100" : "opacity-0"}`}
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </div>
    </section>
  );
}

export default function ProviderTabs() {
  const [active, setActive] = useState("netflix");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ title: string; items: Net27Item[] }[]>([]);
  const [trending, setTrending] = useState<Net27Item[]>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setCategories([]);
    setTrending([]);

    fetch(`/api/provider?id=${active}&action=home`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.ok) {
          setCategories(data.categories || []);
          setTrending(data.trending || []);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [active]);

  return (
    <div>
      <div className="flex items-center gap-2 overflow-x-auto px-4 md:px-8 mb-4 scrollbar-hide">
        {PROVIDERS.map((p) => (
          <button
            key={p.id}
            onClick={() => setActive(p.id)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium whitespace-nowrap transition-all rounded-sm"
            style={{
              backgroundColor: active === p.id ? p.color : "#181818",
              color: active === p.id ? "white" : "#8e8ea0",
              border: `1px solid ${active === p.id ? p.color : "#2a2a3a"}`,
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            {p.name}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
        </div>
      )}

      {!loading && categories.length > 0 && (
        <div className="space-y-4">
          {categories.map((cat) => (
            <ContentRow key={cat.title} title={cat.title} items={cat.items.slice(0, 20)} providerId={active} />
          ))}
        </div>
      )}

      {!loading && categories.length === 0 && trending.length > 0 && (
        <ContentRow title="Trending" items={trending.slice(0, 20)} providerId={active} />
      )}

      {!loading && categories.length === 0 && trending.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[#8e8ea0] text-sm">No content available from this provider</p>
        </div>
      )}
    </div>
  );
}
