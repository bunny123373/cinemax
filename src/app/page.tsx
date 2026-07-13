import Link from "next/link";
import Image from "next/image";
import ContentRow from "@/components/ContentRow";
import { Suspense } from "react";
import { Play, ChevronRight } from "lucide-react";
import { fetchTrending, fetchDiscover } from "@/lib/net27";
import type { Net27Item } from "@/types/net27";

function toSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function mapItem(item: Net27Item) {
  return {
    _id: String(item.tmdbId),
    tmdbId: item.tmdbId,
    type: item.type as "movie" | "series",
    title: item.title,
    slug: toSlug(item.title),
    poster: item.poster || "",
    banner: item.backdrop || item.poster || "",
    description: item.overview,
    year: parseInt(item.year) || 0,
    language: "en",
    category: item.type,
    quality: "HD",
    rating: item.rating,
    contentRating: "",
    tags: [],
    cast: [],
    trailerEmbedUrl: "",
    hlsLink: "",
    embedIframeLink: "",
    peachifyId: "",
    downloadLink: "",
    netmirrorId: "",
    streams: [],
    createdAt: new Date().toISOString(),
  };
}

async function getContent() {
  try {
    const [trending, movies, series] = await Promise.all([
      fetchTrending(),
      fetchDiscover({ type: "movie", sort: "trending" }),
      fetchDiscover({ type: "tv", sort: "trending" }),
    ]);
    return { trending, movies, series };
  } catch {
    return { trending: [], movies: [], series: [] };
  }
}

export default async function HomePage() {
  const { trending, movies, series } = await getContent();
  const heroItem = trending[0] || movies[0] || series[0];
  const allItems = [...trending, ...movies, ...series];
  const uniqueItems = allItems.filter(
    (item, index, self) => index === self.findIndex((t) => t.tmdbId === item.tmdbId)
  );
  const allMapped = uniqueItems.map(mapItem);
  const featured = allMapped.slice(0, 10);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {heroItem && (
        <section className="relative w-full h-[70vh] md:h-[85vh]">
          <Image
            src={heroItem.backdrop || heroItem.poster || ""}
            alt={heroItem.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-16 max-w-[1800px] mx-auto">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-2 py-1 text-xs font-bold bg-[#f5c542] text-[#0a0a0f]">HD</span>
                <span className="text-sm text-[#8e8ea0] capitalize">{heroItem.type}</span>
                {heroItem.rating > 0 && (
                  <span className="text-sm text-[#f5c542]">★ {heroItem.rating.toFixed(1)}</span>
                )}
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">{heroItem.title}</h1>
              {heroItem.overview && (
                <p className="text-sm text-[#8e8ea0] mb-4 line-clamp-3">{heroItem.overview}</p>
              )}
              <div className="flex items-center gap-4">
                <Link
                  href={heroItem.type === "movie"
                    ? `/watch/${toSlug(heroItem.title)}?tmdbId=${heroItem.tmdbId}&type=movie`
                    : `/series/watch/${toSlug(heroItem.title)}?tmdbId=${heroItem.tmdbId}&type=tv&season=1&episode=1`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#f5c542] text-[#0a0a0f] font-semibold hover:bg-[#e0b530] transition-colors"
                >
                  <Play className="w-5 h-5" />
                  Watch Now
                </Link>
                <Link
                  href={heroItem.type === "movie"
                    ? `/movie/${toSlug(heroItem.title)}?tmdbId=${heroItem.tmdbId}`
                    : `/series/${toSlug(heroItem.title)}?tmdbId=${heroItem.tmdbId}`}
                  className="inline-flex items-center gap-2 px-6 py-3 border border-[#2a2a3a] text-white font-medium hover:bg-white/5 transition-colors"
                >
                  More Info
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="relative z-10 -mt-8 space-y-6 pb-16 px-6 max-w-[1800px] mx-auto">
        <div className="pt-8" />
        {featured.length > 0 && (
          <ContentRow title="Trending" items={featured.slice(0, 15)} link="/search" />
        )}
        {movies.length > 0 && (
          <ContentRow title="Movies" items={movies.slice(0, 20).map(mapItem)} link="/search?type=movie" />
        )}
        {series.length > 0 && (
          <ContentRow title="Series" items={series.slice(0, 20).map(mapItem)} link="/search?type=series" />
        )}
      </div>
    </div>
  );
}
