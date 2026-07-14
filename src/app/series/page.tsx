import { fetchDiscover } from "@/lib/net27";
import type { Net27Item } from "@/types/net27";
import Link from "next/link";
import Image from "next/image";

export const revalidate = 60;

function toSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export const metadata = {
  title: "Series",
  description: "Browse and stream premium TV series online in HD on CineMax.",
};

export default async function SeriesPage() {
  const items = await fetchDiscover({ type: "tv", sort: "popular" });

  return (
    <div className="min-h-screen pt-4 md:pt-8">
      <div className="max-w-[1800px] mx-auto px-4 md:px-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8">Series</h1>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {items.map((item) => (
            <Link
              key={item.tmdbId}
              href={`/series/${toSlug(item.title)}?tmdbId=${item.tmdbId}`}
              className="group relative aspect-[2/3] bg-[#12121a] overflow-hidden"
            >
              {item.poster ? (
                <Image
                  src={item.poster}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[#8e8ea0] text-sm font-medium p-2 text-center">
                  {item.title}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-xs md:text-sm font-medium truncate">{item.title}</p>
                <p className="text-[#8e8ea0] text-[10px] md:text-xs">{item.year}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
