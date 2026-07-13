export interface WatchlistItem {
  slug: string;
  tmdbId: number;
  type: "movie" | "series";
  title: string;
  poster: string;
  year: number;
  rating: number;
  addedAt: number;
}

const WL_KEY = "cinemax_watchlist";

export function getWatchlist(): WatchlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToWatchlist(item: WatchlistItem): void {
  if (typeof window === "undefined") return;
  const items = getWatchlist();
  if (!items.some((i) => i.slug === item.slug)) {
    items.unshift(item);
    localStorage.setItem(WL_KEY, JSON.stringify(items));
  }
}

export function removeFromWatchlist(slug: string): void {
  if (typeof window === "undefined") return;
  const items = getWatchlist().filter((i) => i.slug !== slug);
  localStorage.setItem(WL_KEY, JSON.stringify(items));
}

export function isInWatchlist(slug: string): boolean {
  if (typeof window === "undefined") return false;
  return getWatchlist().some((i) => i.slug === slug);
}
