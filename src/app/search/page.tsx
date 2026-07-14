"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Film, Tv } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Net27Item } from "@/types/net27";

function toSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [typeFilter, setTypeFilter] = useState(() => {
    const t = searchParams.get("type") || "all";
    if (t === "series") return "tv";
    return t;
  });
  const [results, setResults] = useState<Net27Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const performSearch = useCallback(async (q: string, type: string) => {
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/net27/search?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      let items: Net27Item[] = json.items || [];
      if (type !== "all") {
        items = items.filter((r) => r.type === type);
      }
      setResults(items);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    const type = searchParams.get("type") || "all";
    const normalized = type === "series" ? "tv" : type;
    setQuery(q);
    setTypeFilter(normalized);
    if (q.trim()) {
      performSearch(q, normalized);
    }
  }, [searchParams, performSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (typeFilter !== "all") params.set("type", typeFilter);
    router.push(`/search?${params}`);
  };

  const handleTypeChange = (t: string) => {
    setTypeFilter(t);
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (t !== "all") params.set("type", t);
    router.push(`/search?${params}`);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-16 md:pt-20 pb-20 md:pb-8">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies & series..."
              className="w-full pl-12 pr-4 py-3 rounded-lg bg-[#12121a] border border-[#2a2a3a] text-white placeholder-[#8e8ea0] focus:outline-none focus:border-[#f5c542]/50 transition-colors text-base"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8e8ea0]" />
          </div>
        </form>

        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6">
          {(["all", "movie", "tv"] as const).map((t) => (
            <button
              key={t}
              onClick={() => handleTypeChange(t)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors ${
                typeFilter === t
                  ? "bg-[#f5c542] text-[#0a0a0f]"
                  : "bg-[#12121a] text-[#8e8ea0] hover:text-white border border-[#2a2a3a]"
              }`}
            >
              {t === "movie" && <Film className="w-3.5 h-3.5" />}
              {t === "tv" && <Tv className="w-3.5 h-3.5" />}
              {t === "all" ? "All" : t === "movie" ? "Movies" : "Series"}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-[#f5c542] border-t-transparent rounded-full" />
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[#8e8ea0] text-base">No results found for &quot;{query}&quot;</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {results.map((item) => {
              const slug = toSlug(item.title);
              const isMovie = item.type === "movie";
              const href = isMovie
                ? `/movie/${slug}?tmdbId=${item.tmdbId}`
                : `/series/${slug}?tmdbId=${item.tmdbId}`;
              return (
                <Link
                  key={item.tmdbId}
                  href={href}
                  className="group block"
                >
                  <div className="relative aspect-[2/3] overflow-hidden bg-[#12121a] border border-[#2a2a3a]">
                    <Image
                      src={item.poster || "https://image.tmdb.org/t/p/w500/placeholder.svg"}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                      sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    />
                    <div className="absolute top-1.5 left-1.5">
                      <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold bg-[#f5c542] text-[#0a0a0f]">
                        {isMovie ? "Movie" : "Series"}
                      </span>
                    </div>
                    {item.rating > 0 && (
                      <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 px-1 py-0.5 bg-[#0a0a0f]/80 text-[10px]">
                        <span className="text-[#f5c542] font-medium">{item.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-1.5 px-0.5">
                    <p className="text-xs sm:text-sm text-white font-medium truncate">{item.title}</p>
                    <p className="text-[10px] sm:text-xs text-[#8e8ea0]">{item.year}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {!loading && !searched && (
          <div className="text-center py-20">
            <Search className="w-12 h-12 sm:w-16 sm:h-16 text-[#2a2a3a] mx-auto mb-4" />
            <p className="text-sm sm:text-base text-[#8e8ea0]">Search for your favorite movies and series</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="w-8 h-8 border-2 border-[#f5c542] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
