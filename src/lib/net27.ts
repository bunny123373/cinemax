import type {
  Net27Item,
  Net27ListResponse,
  Net27TitleDetail,
  Net27EmbedResponse,
  Net27VariantsResponse,
} from "@/types/net27";

const NET27_BASE = "https://net27.cc";
const PROXY_BASE = "https://streamhub-proxy.1545zoya.workers.dev";

function net27Url(path: string): string {
  return `${NET27_BASE}/${path}`;
}

async function net27Fetch<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  const url = new URL(net27Url(path));
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
    }
  }
  const res = await fetch(url.toString(), { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Net27 API error: ${res.status}`);
  return res.json();
}

async function net27FetchNoCache<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  const url = new URL(net27Url(path));
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
    }
  }
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`Net27 API error: ${res.status}`);
  return res.json();
}

export async function fetchTrending(): Promise<Net27Item[]> {
  const res = await net27Fetch<Net27ListResponse>("api/catalog/trending", { window: "day" });
  return res.ok ? res.items : [];
}

export async function fetchHero(): Promise<Net27Item[]> {
  const res = await net27Fetch<Net27ListResponse>("api/catalog/hero");
  return res.ok ? res.items : [];
}

export async function fetchDiscover(params: {
  type?: string;
  sort?: string;
  genre?: string;
  platform?: string;
  country?: string;
  year_from?: string;
  year_to?: string;
  region?: string;
} = {}): Promise<Net27Item[]> {
  const res = await net27Fetch<Net27ListResponse>("api/catalog/discover", {
    type: params.type,
    sort: params.sort,
    genre: params.genre,
    platform: params.platform,
    country: params.country,
    year_from: params.year_from,
    year_to: params.year_to,
    region: params.region || "IN",
  });
  return res.ok ? res.items : [];
}

export async function searchNet27(query: string): Promise<Net27Item[]> {
  const res = await net27FetchNoCache<Net27ListResponse>("api/catalog/search-hybrid", { q: query });
  return res.ok ? res.items : [];
}

export async function fetchTitleDetail(type: string, tmdbId: number): Promise<Net27TitleDetail | null> {
  try {
    const res = await net27Fetch<Net27TitleDetail>(`api/catalog/title/${type}/${tmdbId}`);
    return res;
  } catch {
    return null;
  }
}

export async function fetchEmbedSource(
  tmdbId: number,
  type: string,
  season?: number,
  episode?: number,
  dub?: string
): Promise<Net27EmbedResponse | null> {
  try {
    const params: Record<string, string | number | undefined> = {
      type,
      se: season ?? 1,
      ep: episode ?? 1,
    };
    if (dub) params.dub = dub;
    const res = await net27FetchNoCache<Net27EmbedResponse>(`api/embed-tmdb/${tmdbId}`, params);
    return res.ok ? res : null;
  } catch {
    return null;
  }
}

export async function fetchVariants(
  type: string,
  tmdbId: number,
  season?: number,
  episode?: number
): Promise<Net27VariantsResponse | null> {
  try {
    const res = await net27FetchNoCache<Net27VariantsResponse>(`api/variants-tmdb/${type}/${tmdbId}`, {
      se: season ?? 1,
      ep: episode ?? 1,
    });
    return res;
  } catch {
    return null;
  }
}

export function resolveStreamUrl(resp: Net27EmbedResponse, quality?: number): { url: string; mimeType: string } | null {
  if (!resp) return null;

  const proxy = (rawUrl: string) => {
    if (resp.direct) return rawUrl;
    if (resp.sig && resp.exp) {
      return `${PROXY_BASE}/?url=${encodeURIComponent(rawUrl)}&exp=${resp.exp}&sig=${resp.sig}`;
    }
    return rawUrl;
  };

  if (resp.streams && resp.streams.length > 0) {
    const sorted = [...resp.streams].sort((a, b) => b.resolution - a.resolution);
    let chosen = sorted[0];
    if (quality) {
      const match = sorted.find((s) => s.resolution === quality);
      if (match) chosen = match;
    }
    const url = proxy(chosen.url);
    const mimeType = chosen.url.includes(".m3u8") ? "application/x-mpegURL"
      : chosen.url.includes(".mpd") ? "application/dash+xml"
      : "video/mp4";
    return { url, mimeType };
  }

  if (resp.mp4) {
    return { url: proxy(resp.mp4), mimeType: "video/mp4" };
  }

  return null;
}

export function resolveAllSources(resp: Net27EmbedResponse): { label: string; url: string; mimeType: string; resolution: number }[] {
  if (!resp) return [];

  const proxy = (rawUrl: string) => {
    if (resp.direct) return rawUrl;
    if (resp.sig && resp.exp) {
      return `${PROXY_BASE}/?url=${encodeURIComponent(rawUrl)}&exp=${resp.exp}&sig=${resp.sig}`;
    }
    return rawUrl;
  };

  const sources: { label: string; url: string; mimeType: string; resolution: number }[] = [];

  if (resp.streams && resp.streams.length > 0) {
    const sorted = [...resp.streams].sort((a, b) => b.resolution - a.resolution);
    for (const s of sorted) {
      const mimeType = s.url.includes(".m3u8") ? "application/x-mpegURL"
        : s.url.includes(".mpd") ? "application/dash+xml"
        : "video/mp4";
      sources.push({ label: `${s.resolution}p`, url: proxy(s.url), mimeType, resolution: s.resolution });
    }
  }

  if (resp.mp4) {
    const already = sources.some((s) => s.url.includes(resp.mp4!));
    if (!already) {
      sources.push({ label: `${resp.resolution || "480"}p (MP4)`, url: proxy(resp.mp4), mimeType: "video/mp4", resolution: parseInt(resp.resolution) || 480 });
    }
  }

  return sources;
}
