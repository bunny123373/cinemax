import { ContinueWatchingItem } from "@/types";

const CW_KEY = "cinemax_continue_watching";

export function getContinueWatching(): ContinueWatchingItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CW_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveContinueWatching(item: ContinueWatchingItem): void {
  if (typeof window === "undefined") return;
  const items = getContinueWatching();
  const idx = items.findIndex(
    (i) => i.slug === item.slug && i.seasonNumber === item.seasonNumber && i.episodeNumber === item.episodeNumber
  );
  if (idx >= 0) {
    items[idx] = item;
  } else {
    items.push(item);
  }
  items.sort((a, b) => b.updatedAt - a.updatedAt);
  localStorage.setItem(CW_KEY, JSON.stringify(items.slice(0, 50)));
}

export function removeContinueWatching(slug: string): void {
  if (typeof window === "undefined") return;
  const items = getContinueWatching().filter((i) => i.slug !== slug);
  localStorage.setItem(CW_KEY, JSON.stringify(items));
}
