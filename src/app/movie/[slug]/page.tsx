import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Star, Play, ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import { fetchTitleDetail, searchNet27 } from "@/lib/net27";
import ContentRow from "@/components/ContentRow";
import type { Net27TitleDetail, Net27Item } from "@/types/net27";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tmdbId?: string }>;
}

function toSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function getMovieData(slug: string, tmdbId?: string) {
  if (tmdbId) {
    const detail = await fetchTitleDetail("movie", Number(tmdbId));
    if (detail) {
      const item: Net27Item = {
        tmdbId: Number(tmdbId),
        title: detail.title,
        year: detail.year,
        poster: detail.poster,
        backdrop: detail.backdrop,
        overview: detail.overview,
        rating: detail.rating,
        type: "movie",
      };
      return { item, detail, related: detail.recommendations };
    }
  }
  const items = await searchNet27(slug.replace(/-/g, " "));
  const movie = items.find((i) => i.type === "movie") || items[0];
  if (!movie) return null;
  const detail = await fetchTitleDetail("movie", movie.tmdbId);
  return { item: movie, detail, related: detail?.recommendations || items.slice(1, 11) };
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const data = await getMovieData(slug, sp.tmdbId);
  if (!data) return { title: "Not Found" };
  const { item } = data;
  return {
    title: `${item.title} | CineMax`,
    description: item.overview?.slice(0, 160) || `Watch ${item.title} online in HD on CineMax.`,
    openGraph: {
      title: `${item.title} | CineMax`,
      description: item.overview?.slice(0, 160),
      images: [{ url: item.backdrop || item.poster || "" }],
      type: "video.movie",
    },
  };
}

export default async function MoviePage({ params, searchParams }: Props) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const data = await getMovieData(slug, sp.tmdbId);
  if (!data) notFound();

  const { item, detail, related } = data;
  const watchHref = `/watch/${toSlug(item.title)}?tmdbId=${item.tmdbId}&type=movie`;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="relative w-full h-[50vh] md:h-[70vh]">
        <Image
          src={item.backdrop || item.poster || ""}
          alt={item.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/30 to-transparent" />
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 -mt-40">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-48 shrink-0 hidden md:block">
            <Image
              src={item.poster || ""}
              alt={item.title}
              width={200}
              height={300}
              className="rounded-lg shadow-2xl"
            />
          </div>

          <div className="flex-1 mt-auto pb-8">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-2 py-1 text-xs font-bold bg-[#f5c542] text-[#0a0a0f]">
                {item.type === "movie" ? "Movie" : "Series"}
              </span>
              <span className="text-sm text-[#8e8ea0]">{item.year}</span>
              {item.rating > 0 && (
                <span className="flex items-center gap-1 text-sm text-[#f5c542]">
                  <Star className="w-4 h-4 fill-current" />
                  {item.rating.toFixed(1)}
                </span>
              )}
              {detail?.runtime && (
                <span className="text-sm text-[#8e8ea0]">{detail.runtime} min</span>
              )}
              {detail?.certification?.rating && (
                <span className="px-2 py-0.5 text-xs bg-[#2a2a3a] text-white">{detail.certification.rating}</span>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{item.title}</h1>

            {detail?.tagline && (
              <p className="text-sm italic text-[#8e8ea0] mb-4">&quot;{detail.tagline}&quot;</p>
            )}

            {detail?.genres && detail.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {detail.genres.map((g) => (
                  <span key={g.name} className="px-3 py-1 text-xs bg-[#1a1a2e] text-[#8e8ea0]">{g.name}</span>
                ))}
              </div>
            )}

            <p className="text-[#8e8ea0] leading-relaxed mb-6 max-w-3xl line-clamp-6">
              {item.overview}
            </p>

            {detail?.cast && detail.cast.length > 0 && (
              <div className="mb-6">
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {detail.cast.slice(0, 10).map((actor, idx) => (
                    <div key={idx} className="flex-shrink-0 text-center w-20">
                      <div className="w-14 h-14 mx-auto rounded-full overflow-hidden bg-[#2a2a3a] mb-1">
                        {actor.photo ? (
                          <Image
                            src={actor.photo}
                            alt={actor.name}
                            width={56}
                            height={56}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#8e8ea0] text-xs">
                            {actor.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-white font-medium truncate">{actor.name}</p>
                      <p className="text-[9px] text-[#8e8ea0] truncate">{actor.character}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Link
              href={watchHref}
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#f5c542] text-[#0a0a0f] font-semibold hover:bg-[#e0b530] transition-colors"
            >
              <Play className="w-5 h-5" fill="#0a0a0f" />
              Watch Now
            </Link>
          </div>
        </div>
      </div>

      {detail?.recommendations && detail.recommendations.length > 0 && (
        <div className="mt-16 pb-16 px-6 max-w-[1800px] mx-auto">
          <ContentRow
            title="More Like This"
            items={detail.recommendations.map((r) => ({
              _id: String(r.tmdbId),
              tmdbId: r.tmdbId,
              type: r.type as "movie" | "series",
              title: r.title,
              slug: toSlug(r.title),
              poster: r.poster || "",
              banner: r.backdrop || "",
              description: r.overview,
              year: parseInt(r.year) || 0,
              language: "en",
              category: r.type,
              quality: "HD",
              rating: r.rating,
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
            }))}
          />
        </div>
      )}
    </div>
  );
}
