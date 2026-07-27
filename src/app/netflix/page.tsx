import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getProvider } from "@/lib/plugins/registry";
import type { Net27Item } from "@/types/net27";

export const metadata: Metadata = {
  title: "Netflix — CineMax",
  description: "Browse and stream Netflix Originals on CineMax",
};

function toSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const NETFLIX_GENRES = [
  { id: "28", label: "Action & Thriller" },
  { id: "35", label: "Comedy" },
  { id: "18", label: "Drama" },
  { id: "27", label: "Horror" },
  { id: "878", label: "Sci-Fi" },
  { id: "53", label: "Suspense" },
  { id: "10749", label: "Romance" },
  { id: "16", label: "Anime" },
  { id: "99", label: "Documentary" },
  { id: "80", label: "True Crime" },
] as const;

async function getNetflixContent() {
  try {
    const provider = getProvider();
    const [trending, homeData] = await Promise.all([
      provider.fetchTrending(),
      provider.fetchHomeCategories(),
    ]);

    const heroItems = homeData.banners.length > 0
      ? homeData.banners.slice(0, 6)
      : trending.slice(0, 5);

    const genreRows = await Promise.all(
      NETFLIX_GENRES.map(async (g) => {
        const items = await provider.fetchDiscover({ type: "movie", sort: "trending", genre: g.id });
        return { ...g, items };
      })
    );

    const tvRows = await Promise.all(
      NETFLIX_GENRES.slice(0, 6).map(async (g) => {
        const items = await provider.fetchDiscover({ type: "tv", sort: "trending", genre: g.id });
        return { ...g, items };
      })
    );

    return { trending, heroItems, categories: homeData.categories, genreRows, tvRows };
  } catch {
    return { trending: [], heroItems: [], categories: [], genreRows: [], tvRows: [] };
  }
}

function HeroBanner({ items }: { items: Net27Item[] }) {
  if (!items.length) return null;

  return (
    <section className="relative w-full h-[50vh] min-h-[320px] sm:h-[55vh] md:h-[65vh] lg:h-[75vh]">
      <div className="relative w-full h-full">
        <Image
          src={items[0].backdrop || items[0].poster || ""}
          alt={items[0].title}
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/60 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 md:p-12 lg:p-16 max-w-[1800px] mx-auto z-10 pb-10 sm:pb-12">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <span className="px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold bg-[#E50914] text-white">N</span>
            <span className="text-xs sm:text-sm text-[#8e8ea0]">Netflix Original</span>
            {items[0].rating > 0 && (
              <span className="text-xs sm:text-sm text-[#46d369]">★ {items[0].rating.toFixed(1)}</span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-2 leading-tight">
            {items[0].title}
          </h1>
          {items[0].overview && (
            <p className="text-xs sm:text-sm md:text-base text-[#8e8ea0] mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3 max-w-xl">
              {items[0].overview}
            </p>
          )}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <Link
              href={items[0].type === "movie"
                ? `/watch/${toSlug(items[0].title)}?tmdbId=${items[0].tmdbId}&type=movie${items[0].detailPath ? `&dp=${encodeURIComponent(items[0].detailPath)}` : ""}`
                : `/series/watch/${toSlug(items[0].title)}?tmdbId=${items[0].tmdbId}&type=tv&season=1&episode=1${items[0].detailPath ? `&dp=${encodeURIComponent(items[0].detailPath)}` : ""}`}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 bg-white text-[#0a0a0f] text-xs sm:text-sm md:text-base font-semibold hover:bg-white/80 transition-colors"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="#0a0a0f"><polygon points="5 3 19 12 5 21" /></svg>
              Play
            </Link>
            <Link
              href={items[0].type === "movie"
                ? `/movie/${toSlug(items[0].title)}?tmdbId=${items[0].tmdbId}${items[0].detailPath ? `&dp=${encodeURIComponent(items[0].detailPath)}` : ""}`
                : `/series/${toSlug(items[0].title)}?tmdbId=${items[0].tmdbId}${items[0].detailPath ? `&dp=${encodeURIComponent(items[0].detailPath)}` : ""}`}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 bg-[#6d6d80]/60 text-white text-xs sm:text-sm md:text-base font-medium hover:bg-[#6d6d80]/40 transition-colors"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              More Info
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function NetflixRow({ title, items }: { title: string; items: Net27Item[] }) {
  if (!items.length) return null;

  return (
    <section className="relative overflow-hidden">
      <div className="px-4 md:px-8 mb-3">
        <h2 className="text-lg md:text-xl font-bold text-white">{title}</h2>
      </div>
      <div className="flex gap-2 overflow-x-auto px-4 md:px-8 pb-12 pt-1 scrollbar-hide">
        {items.map((item) => {
          const slug = toSlug(item.title);
          const isMovie = item.type === "movie";
          const href = isMovie
            ? `/movie/${slug}?tmdbId=${item.tmdbId}${item.detailPath ? `&dp=${encodeURIComponent(item.detailPath)}` : ""}`
            : `/series/${slug}?tmdbId=${item.tmdbId}${item.detailPath ? `&dp=${encodeURIComponent(item.detailPath)}` : ""}`;
          const watchHref = isMovie
            ? `/watch/${slug}?tmdbId=${item.tmdbId}&type=movie${item.detailPath ? `&dp=${encodeURIComponent(item.detailPath)}` : ""}`
            : `/series/watch/${slug}?tmdbId=${item.tmdbId}&type=tv&season=1&episode=1${item.detailPath ? `&dp=${encodeURIComponent(item.detailPath)}` : ""}`;

          return (
            <Link key={item.tmdbId} href={href} className="group block flex-shrink-0 w-[140px] sm:w-[160px] md:w-[200px]">
              <div className="relative aspect-[2/3] overflow-hidden rounded-sm bg-[#181818]">
                <Image
                  src={item.poster || "https://image.tmdb.org/t/p/w500/placeholder.svg"}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 35vw, (max-width: 1024px) 25vw, 20vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Link
                    href={watchHref}
                    onClick={(e) => e.stopPropagation()}
                    className="w-10 h-10 rounded-full bg-[#E50914] flex items-center justify-center shadow-lg hover:bg-[#b20710] transition-colors"
                  >
                    <svg className="w-4 h-4 text-white ml-0.5" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21" /></svg>
                  </Link>
                </div>
                {item.rating > 0 && (
                  <div className="absolute top-2 left-2">
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#E50914] text-white">★ {item.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
              <p className="mt-2 px-0.5 text-xs text-white font-medium truncate">{item.title}</p>
              <p className="px-0.5 text-[10px] text-[#8e8ea0]">{item.year || "N/A"}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default async function NetflixPage() {
  const { trending, heroItems, categories, genreRows, tvRows } = await getNetflixContent();
    const top10 = trending.slice(0, 10);

  return (
    <div className="min-h-screen bg-[#0a0a0f] overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Netflix — CineMax",
            url: "https://cinemax77.vercel.app/netflix",
            description: "Browse Netflix Originals on CineMax — free streaming.",
          }),
        }}
      />

      <HeroBanner items={heroItems} />

      <div className="relative z-10 -mt-8 space-y-4 pb-16 px-6 max-w-[1800px] mx-auto">
        <div className="pt-6" />

        {top10.length > 0 && (
          <NetflixRow title="Top 10 Today" items={top10} />
        )}

        {categories.map((cat) =>
          cat.items.length > 0 ? (
            <NetflixRow key={cat.title} title={cat.title} items={cat.items.slice(0, 20)} />
          ) : null
        )}

        {genreRows.map((genre) =>
          genre.items.length > 0 ? (
            <NetflixRow key={`movie-${genre.id}`} title={genre.label} items={genre.items.slice(0, 20)} />
          ) : null
        )}

        {tvRows.map((genre) =>
          genre.items.length > 0 ? (
            <NetflixRow key={`tv-${genre.id}`} title={`${genre.label} Series`} items={genre.items.slice(0, 20)} />
          ) : null
        )}
      </div>
    </div>
  );
}
