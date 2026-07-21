import Link from "next/link";
import Image from "next/image";
import ContentRow from "@/components/ContentRow";
import TopTenRow from "@/components/TopTenRow";
import ContinueWatchingRow from "@/components/ContinueWatchingRow";

import HeroSlider from "@/components/HeroSlider";
import { Suspense } from "react";
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
  { id: "28", label: "Action Movies" },
  { id: "35", label: "Comedy Movies" },
  { id: "18", label: "Drama Movies" },
  { id: "27", label: "Horror Movies" },
  { id: "878", label: "Sci-Fi Movies" },
  { id: "53", label: "Thriller Movies" },
  { id: "10749", label: "Romance Movies" },
  { id: "16", label: "Animation Movies" },
  { id: "12", label: "Adventure Movies" },
  { id: "14", label: "Fantasy Movies" },
  { id: "80", label: "Crime Movies" },
  { id: "9648", label: "Mystery Movies" },
] as const;

const TV_GENRES = [
  { id: "10759", label: "Action & Adventure Series" },
  { id: "35", label: "Comedy Series" },
  { id: "18", label: "Drama Series" },
  { id: "9648", label: "Mystery Series" },
  { id: "10765", label: "Sci-Fi & Fantasy Series" },
  { id: "10768", label: "War & Politics Series" },
  { id: "80", label: "Crime Series" },
  { id: "99", label: "Documentary Series" },
] as const;

async function getContent() {
  try {
    const [trending, movies, series, recentMovies, recentSeries] = await Promise.all([
      fetchTrending(),
      fetchDiscover({ type: "movie", sort: "trending" }),
      fetchDiscover({ type: "tv", sort: "trending" }),
      fetchDiscover({ type: "movie", sort: "latest" }),
      fetchDiscover({ type: "tv", sort: "latest" }),
    ]);

    const movieGenreRows = await Promise.all(
      GENRES.map(async (g) => {
        const items = await fetchDiscover({ type: "movie", sort: "trending", genre: g.id });
        return { ...g, items };
      })
    );

    const tvGenreRows = await Promise.all(
      TV_GENRES.map(async (g) => {
        const items = await fetchDiscover({ type: "tv", sort: "trending", genre: g.id });
        return { ...g, items };
      })
    );

    return { trending, movies, series, recentMovies, recentSeries, movieGenreRows, tvGenreRows };
  } catch {
    return { trending: [], movies: [], series: [], recentMovies: [], recentSeries: [], movieGenreRows: [], tvGenreRows: [] };
  }
}

export default async function HomePage() {
  const { trending, movies, series, recentMovies, recentSeries, movieGenreRows, tvGenreRows } = await getContent();
  const allItems = [...trending, ...movies, ...series];
  const uniqueItems = allItems.filter(
    (item, index, self) => index === self.findIndex((t) => t.tmdbId === item.tmdbId)
  );
  const heroItems = uniqueItems.slice(0, 5);
  const allMapped = uniqueItems.map(mapItem);
  const featured = allMapped.slice(0, 10);
  const recentAll = [...recentMovies, ...recentSeries]
    .filter((item, index, self) => index === self.findIndex((t) => t.tmdbId === item.tmdbId))
    .slice(0, 20);

  return (
    <div className="min-h-screen bg-[#0a0a0f] overflow-hidden">
      <HeroSlider items={heroItems} />

      <div className="relative z-10 -mt-8 space-y-6 pb-16 px-6 max-w-[1800px] mx-auto">
        <div className="pt-8" />

        <ContinueWatchingRow />

        {featured.length > 0 && (
          <ContentRow title="Trending Now" items={featured.slice(0, 15)} link="/search" />
        )}

        {movies.length > 0 && (
          <TopTenRow title="Top 10 Movies" items={movies.slice(0, 10).map(mapItem)} link="/search?type=movie" />
        )}

        {recentAll.length > 0 && (
          <ContentRow title="Recently Added" items={recentAll.map(mapItem)} link="/search" />
        )}

        {series.length > 0 && (
          <TopTenRow title="Top 10 Series" items={series.slice(0, 10).map(mapItem)} link="/search?type=series" />
        )}

        {movies.length > 0 && (
          <ContentRow title="Movies" items={movies.slice(0, 20).map(mapItem)} link="/search?type=movie" />
        )}

        {movieGenreRows.map((genre) =>
          genre.items.length > 0 ? (
            <ContentRow
              key={`movie-${genre.id}`}
              title={genre.label}
              items={genre.items.slice(0, 20).map(mapItem)}
              link={`/search?type=movie&genre=${genre.id}`}
            />
          ) : null
        )}

        {series.length > 0 && (
          <ContentRow title="Series" items={series.slice(0, 20).map(mapItem)} link="/search?type=series" />
        )}

        {tvGenreRows.map((genre) =>
          genre.items.length > 0 ? (
            <ContentRow
              key={`tv-${genre.id}`}
              title={genre.label}
              items={genre.items.slice(0, 20).map(mapItem)}
              link={`/search?type=series&genre=${genre.id}`}
            />
          ) : null
        )}
      </div>
    </div>
  );
}
