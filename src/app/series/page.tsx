import ContentRow from "@/components/ContentRow";
import { fetchDiscover } from "@/lib/net27";
import type { Net27Item } from "@/types/net27";

export const revalidate = 60;

function toSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function mapItem(item: Net27Item) {
  return {
    _id: String(item.tmdbId),
    tmdbId: item.tmdbId,
    type: "series" as const,
    title: item.title,
    slug: toSlug(item.title),
    poster: item.poster || "",
    banner: item.backdrop || item.poster || "",
    description: item.overview,
    year: parseInt(item.year) || 0,
    language: "en",
    category: "series",
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

export const metadata = {
  title: "Series",
  description: "Browse and stream premium TV series online in HD on CineMax.",
};

export default async function SeriesPage() {
  const [trending, popular, topRated, newReleases] = await Promise.all([
    fetchDiscover({ type: "tv", sort: "trending" }),
    fetchDiscover({ type: "tv", sort: "popular" }),
    fetchDiscover({ type: "tv", sort: "top_rated" }),
    fetchDiscover({ type: "tv", sort: "new" }),
  ]);

  return (
    <div className="min-h-screen pt-4 md:pt-8">
      <div className="max-w-[1800px] mx-auto px-4 md:px-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8">Series</h1>
      </div>

      <div className="space-y-8 md:space-y-12">
        {trending.length > 0 && (
          <ContentRow title="Trending Now" items={trending.map(mapItem)} />
        )}
        {popular.length > 0 && (
          <ContentRow title="Popular Series" items={popular.map(mapItem)} />
        )}
        {topRated.length > 0 && (
          <ContentRow title="Top Rated" items={topRated.map(mapItem)} />
        )}
        {newReleases.length > 0 && (
          <ContentRow title="New Releases" items={newReleases.map(mapItem)} />
        )}
      </div>
    </div>
  );
}
