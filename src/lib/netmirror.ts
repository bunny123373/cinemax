const SCREENSCAPE_SEARCH = "https://screenscape.me/api/search";

async function screenscapeSearch(query: string) {
  const res = await fetch(`${SCREENSCAPE_SEARCH}?q=${encodeURIComponent(query)}&page=1`, {
    headers: { accept: "application/json" },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.results || [];
}

export async function searchNetMirror(query: string) {
  const results = await screenscapeSearch(query);
  return results.map((r: any) => ({
    title: r.title || r.name || "",
    year: r.release_date?.split("-")[0] || r.first_air_date?.split("-")[0] || "",
    imageUrl: r.poster_path ? `https://image.tmdb.org/t/p/w500${r.poster_path}` : "",
    image: r.backdrop_path ? `https://image.tmdb.org/t/p/w500${r.backdrop_path}` : "",
    description: r.overview || "",
    rating: r.vote_average || 0,
    type: r.media_type === "tv" ? "series" : "movie",
    tmdbId: r.id,
    language: r.original_language || "en",
    category: r.genre_ids?.join(",") || "",
    formats: r.media_type === "tv" ? ["Series"] : [],
    provider: "screenscape",
    url: "",
  }));
}

export async function getEmbedUrl(tmdbId: number, mediaType: string = "movie") {
  const type = mediaType === "series" || mediaType === "tv" ? "tv" : "movie";
  return `https://screenscape.me/embed?tmdb=${tmdbId}&type=${type}`;
}

export async function getProviderPost(provider: string, url: string) {
  return { error: "Not available" };
}

export async function getProviderStream(provider: string, id: string) {
  return { error: "Not available" };
}

export async function scrapeEmbedUrl(providerUrl: string) {
  return null;
}
