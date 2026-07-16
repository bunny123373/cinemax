"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Film, Tv, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Net27Item } from "@/types/net27";

function toSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const GENRES = [
  { id: "28", label: "Action" },
  { id: "35", label: "Comedy" },
  { id: "18", label: "Drama" },
  { id: "27", label: "Horror" },
  { id: "878", label: "Sci-Fi" },
  { id: "53", label: "Thriller" },
  { id: "10749", label: "Romance" },
  { id: "16", label: "Animation" },
  { id: "99", label: "Documentary" },
  { id: "80", label: "Crime" },
  { id: "12", label: "Adventure" },
  { id: "36", label: "History" },
  { id: "14", label: "Fantasy" },
  { id: "9648", label: "Mystery" },
  { id: "10752", label: "War" },
  { id: "37", label: "Western" },
  { id: "10402", label: "Music" },
  { id: "10751", label: "Family" },
];

const YEARS = ["2026", "2025", "2024", "2023", "2022", "2020-2021", "2015-2019", "2010-2014", "2000-2009", "1990-1999", "Before 1990"];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [typeFilter, setTypeFilter] = useState(() => {
    const t = searchParams.get("type") || "all";
    if (t === "series") return "tv";
    return t;
  });
  const [genreFilter, setGenreFilter] = useState(searchParams.get("genre") || "");
  const [yearFilter, setYearFilter] = useState(searchParams.get("year") || "");
  const [results, setResults] = useState<Net27Item[]>([]);
  const [browseResults, setBrowseResults] = useState<Net27Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const buildParams = useCallback((overrides?: { q?: string; type?: string; genre?: string; year?: string }) => {
    const q = overrides?.q ?? query;
    const t = overrides?.type ?? typeFilter;
    const g = overrides?.genre ?? genreFilter;
    const y = overrides?.year ?? yearFilter;
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (t !== "all") params.set("type", t);
    if (g) params.set("genre", g);
    if (y) params.set("year", y);
    return params;
  }, [query, typeFilter, genreFilter, yearFilter]);

  const performSearch = useCallback(async (q: string, type: string, genre: string, year: string) => {
    setLoading(true);
    setSearched(true);
    try {
      if (q.trim()) {
        const res = await fetch(`/api/net27/search?q=${encodeURIComponent(q)}`);
        const json = await res.json();
        let items: Net27Item[] = json.items || [];
        if (type !== "all") items = items.filter((r) => r.type === type);
        if (genre) items = items.filter((r) => (r as any).genre_ids?.includes(genre) || true);
        setResults(items);
      } else {
        const sort = "trending";
        const typeParam = type === "tv" ? "tv" : type === "movie" ? "movie" : undefined;
        const promises: Promise<Net27Item[]>[] = [];
        if (typeParam) {
          promises.push(fetch(`/api/net27/discover?type=${typeParam}&sort=${sort}&genre=${genre}&year=${year}`).then(r => r.json()).then(d => d.items || []));
        } else {
          promises.push(fetch(`/api/net27/discover?type=movie&sort=${sort}&genre=${genre}&year=${year}`).then(r => r.json()).then(d => d.items || []));
          promises.push(fetch(`/api/net27/discover?type=tv&sort=${sort}&genre=${genre}&year=${year}`).then(r => r.json()).then(d => d.items || []));
        }
        const all = await Promise.all(promises);
        const merged = all.flat().filter((item, i, self) => i === self.findIndex((t) => t.tmdbId === item.tmdbId));
        setResults(merged);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    const type = searchParams.get("type") || "all";
    const genre = searchParams.get("genre") || "";
    const year = searchParams.get("year") || "";
    const normalized = type === "series" ? "tv" : type;
    setQuery(q);
    setTypeFilter(normalized);
    setGenreFilter(genre);
    setYearFilter(year);
    if (q.trim() || genre || year || normalized !== "all") {
      performSearch(q, normalized, genre, year);
    }
  }, [searchParams, performSearch]);

  useEffect(() => {
    if (!searched) {
      fetch("/api/net27/discover?type=movie&sort=trending")
        .then(r => r.json())
        .then(d => setBrowseResults(d.items || []))
        .catch(() => {});
    }
  }, [searched]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?${buildParams()}`);
  };

  const handleFilterChange = (key: string, value: string) => {
    const overrides: Record<string, string> = {};
    if (key === "type") overrides.type = value;
    if (key === "genre") overrides.genre = value;
    if (key === "year") overrides.year = value;
    router.push(`/search?${buildParams(overrides)}`);
    if (key === "type") setTypeFilter(value);
    if (key === "genre") setGenreFilter(value);
    if (key === "year") setYearFilter(value);
  };

  const clearFilters = () => {
    setGenreFilter("");
    setYearFilter("");
    setTypeFilter("all");
    router.push("/search");
  };

  const hasActiveFilters = genreFilter || yearFilter || typeFilter !== "all";

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-16 md:pt-20 pb-20 md:pb-8">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies & series..."
              className="w-full pl-12 pr-12 py-3 rounded-lg bg-[#12121a] border border-[#2a2a3a] text-white placeholder-[#8e8ea0] focus:outline-none focus:border-[#f5c542]/50 transition-colors text-base"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8e8ea0]" />
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded transition-colors ${showFilters ? "bg-[#f5c542] text-[#0a0a0f]" : "text-[#8e8ea0] hover:text-white"}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
          {(["all", "movie", "tv"] as const).map((t) => (
            <button
              key={t}
              onClick={() => handleFilterChange("type", t)}
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
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>

        {showFilters && (
          <div className="mb-6 p-4 bg-[#12121a] border border-[#2a2a3a] rounded-lg animate-slide-up">
            <div className="mb-4">
              <p className="text-xs text-[#8e8ea0] mb-2 font-medium">Genre</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleFilterChange("genre", "")}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${!genreFilter ? "bg-[#f5c542] text-[#0a0a0f]" : "bg-[#1a1a2e] text-[#8e8ea0] hover:text-white border border-[#2a2a3a]"}`}
                >
                  All
                </button>
                {GENRES.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => handleFilterChange("genre", g.id)}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${genreFilter === g.id ? "bg-[#f5c542] text-[#0a0a0f]" : "bg-[#1a1a2e] text-[#8e8ea0] hover:text-white border border-[#2a2a3a]"}`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-[#8e8ea0] mb-2 font-medium">Year</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleFilterChange("year", "")}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${!yearFilter ? "bg-[#f5c542] text-[#0a0a0f]" : "bg-[#1a1a2e] text-[#8e8ea0] hover:text-white border border-[#2a2a3a]"}`}
                >
                  All
                </button>
                {YEARS.map((y) => (
                  <button
                    key={y}
                    onClick={() => handleFilterChange("year", y)}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${yearFilter === y ? "bg-[#f5c542] text-[#0a0a0f]" : "bg-[#1a1a2e] text-[#8e8ea0] hover:text-white border border-[#2a2a3a]"}`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-[#f5c542] border-t-transparent rounded-full" />
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[#8e8ea0] text-base">No results found</p>
          </div>
        )}

        {!loading && searched && results.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {results.map((item) => {
              const slug = toSlug(item.title);
              const isMovie = item.type === "movie";
              const href = isMovie
                ? `/movie/${slug}?tmdbId=${item.tmdbId}`
                : `/series/${slug}?tmdbId=${item.tmdbId}`;
              return (
                <Link key={item.tmdbId} href={href} className="group block">
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
          <div>
            {browseResults.length > 0 ? (
              <>
                <p className="text-sm text-[#8e8ea0] mb-4 font-medium">Browse Trending</p>
                <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                  {browseResults.slice(0, 20).map((item) => {
                    const slug = toSlug(item.title);
                    const isMovie = item.type === "movie";
                    const href = isMovie
                      ? `/movie/${slug}?tmdbId=${item.tmdbId}`
                      : `/series/${slug}?tmdbId=${item.tmdbId}`;
                    return (
                      <Link key={item.tmdbId} href={href} className="group block">
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
              </>
            ) : (
              <div className="text-center py-20">
                <Search className="w-12 h-12 sm:w-16 sm:h-16 text-[#2a2a3a] mx-auto mb-4" />
                <p className="text-sm sm:text-base text-[#8e8ea0]">Search for your favorite movies and series</p>
              </div>
            )}
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
