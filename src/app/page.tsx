import Link from "next/link";
import Image from "next/image";
import ContentRow from "@/components/ContentRow";
import TopTenRow from "@/components/TopTenRow";
import ContinueWatchingRow from "@/components/ContinueWatchingRow";
import HeroSlider from "@/components/HeroSlider";
import LandingSplash from "@/components/LandingSplash";
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

const GENRES = [
  { id: "28", label: "Action" },
  { id: "35", label: "Comedy" },
  { id: "18", label: "Drama" },
  { id: "27", label: "Horror" },
  { id: "878", label: "Sci-Fi" },
] as const;

async function getContent() {
  try {
    const [trending, movies, series] = await Promise.all([
      fetchTrending(),
      fetchDiscover({ type: "movie", sort: "trending" }),
      fetchDiscover({ type: "tv", sort: "trending" }),
    ]);

    const genreRows = await Promise.all(
      GENRES.map(async (g) => {
        const items = await fetchDiscover({ type: "movie", sort: "trending", genre: g.id });
        return { ...g, items };
      })
    );

    return { trending, movies, series, genreRows };
  } catch {
    return { trending: [], movies: [], series: [], genreRows: [] };
  }
}

export default async function HomePage() {
  const { trending, movies, series, genreRows } = await getContent();
  const allItems = [...trending, ...movies, ...series];
  const uniqueItems = allItems.filter(
    (item, index, self) => index === self.findIndex((t) => t.tmdbId === item.tmdbId)
  );
  const heroItems = uniqueItems.slice(0, 5);
  const allMapped = uniqueItems.map(mapItem);
  const featured = allMapped.slice(0, 10);

  return (
    <LandingSplash>
      <div className="min-h-screen bg-[#0a0a0f] overflow-hidden">
        <HeroSlider items={heroItems} />

        <div className="relative z-10 -mt-8 space-y-6 pb-16 px-6 max-w-[1800px] mx-auto">
          <div className="pt-8" />
          <ContinueWatchingRow />
          {featured.length > 0 && (
            <ContentRow title="Trending" items={featured.slice(0, 15)} link="/search" />
          )}

          {movies.length > 0 && (
            <TopTenRow title="Top 10 Trending Movies" items={movies.slice(0, 10).map(mapItem)} link="/search?type=movie" />
          )}

          {movies.length > 0 && (
            <ContentRow title="Movies" items={movies.slice(0, 20).map(mapItem)} link="/search?type=movie" />
          )}
          {series.length > 0 && (
            <ContentRow title="Series" items={series.slice(0, 20).map(mapItem)} link="/search?type=series" />
          )}

          {series.length > 0 && (
            <TopTenRow title="Top 10 Trending Series" items={series.slice(0, 10).map(mapItem)} link="/search?type=series" />
          )}

          {genreRows.map((genre) =>
            genre.items.length > 0 ? (
              <ContentRow
                key={genre.id}
                title={genre.label}
                items={genre.items.slice(0, 20).map(mapItem)}
                link={`/search?type=movie&genre=${genre.id}`}
              />
            ) : null
          )}
        </div>
      </div>
    </LandingSplash>
  );
}
