import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProvider } from "@/lib/plugins/registry";
import SeriesDetail from "@/components/SeriesDetail";
import type { Net27Item } from "@/types/net27";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tmdbId?: string; dp?: string; pid?: string }>;
}

async function getSeriesData(slug: string, tmdbId?: string, dp?: string, pid?: string) {
  const provider = getProvider(pid);
  if (tmdbId) {
    const detail = await provider.fetchTitleDetail("tv", tmdbId, dp);
    if (detail) {
      const item: Net27Item = {
        tmdbId,
        title: detail.title,
        year: detail.year,
        poster: detail.poster,
        backdrop: detail.backdrop,
        overview: detail.overview,
        rating: detail.rating,
        type: "tv",
        detailPath: dp || undefined,
      };
      return { item, detail, related: detail.recommendations };
    }
  }
  const items = await provider.search(slug.replace(/-/g, " "));
  const series = items.find((i) => i.type === "tv") || items[0];
  if (!series) return null;
  const detail = await provider.fetchTitleDetail("tv", series.tmdbId, series.detailPath);
  return { item: series, detail, related: detail?.recommendations || items.slice(1, 11) };
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const data = await getSeriesData(slug, sp.tmdbId, sp.dp, sp.pid);
  if (!data) return { title: "Not Found" };
  const { item, detail } = data;
  const desc = item.overview?.slice(0, 160) || `Watch ${item.title} series online in HD on CineMax.`;
  const keywords = [item.title, "watch online", "stream", "HD", "series", "tv show", ...(detail?.genres?.map((g: any) => g.name || g) || [])];
  return {
    title: `${item.title} (${item.year}) | Watch Online HD | CineMax`,
    description: desc,
    keywords,
    openGraph: {
      title: `${item.title} (${item.year}) | CineMax`,
      description: desc,
      images: [{ url: item.backdrop || item.poster || "", width: 1280, height: 720 }],
      type: "video.tv_show",
      siteName: "CineMax",
    },
    twitter: {
      card: "summary_large_image",
      title: `${item.title} (${item.year}) | CineMax`,
      description: desc,
      images: [item.backdrop || item.poster || ""],
    },
    alternates: { canonical: `https://cinemax77.vercel.app/series/${slug}?tmdbId=${item.tmdbId}` },
  };
}

export default async function SeriesDetailPage({ params, searchParams }: Props) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const data = await getSeriesData(slug, sp.tmdbId, sp.dp, sp.pid);
  if (!data) notFound();

  return <SeriesDetail item={data.item} detail={data.detail} related={data.related} pid={sp.pid} />;
}
