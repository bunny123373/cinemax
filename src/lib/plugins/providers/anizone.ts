import type { ContentProvider, StreamSource } from "../types";
import type { Net27Item, Net27TitleDetail, Net27EmbedResponse, Net27VariantsResponse } from "@/types/net27";
import * as cheerio from "cheerio";

const BASE = "https://anizone.to";

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

function toId(url: string): string {
  return url.replace(/[^a-z0-9]/gi, "_").slice(0, 60);
}

function mapItem(el: any): Net27Item | null {
  const a = el.find("a").first();
  const img = el.find("img").first();
  const href = a.attr("href") || "";
  const title = img.attr("alt") || el.find("h3").text().trim() || "";
  const poster = img.attr("src") || "";
  if (!title || !href) return null;
  const fullUrl = href.startsWith("http") ? href : BASE + href;
  return {
    tmdbId: toId(fullUrl),
    title,
    year: "",
    poster: poster || null,
    backdrop: poster || null,
    overview: "",
    rating: 0,
    type: "series",
    detailPath: fullUrl,
  };
}

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, { headers: HEADERS, cache: "no-store", signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`Anizone ${res.status}`);
  return res.text();
}

async function livewireRequest(token: string, snapshot: string, updates: Record<string, string>, calls: any[]): Promise<any> {
  const payload = {
    _token: token,
    components: [{ snapshot, updates, calls }],
  };
  const res = await fetch(`${BASE}/livewire/update`, {
    method: "POST",
    headers: { ...HEADERS, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Livewire ${res.status}`);
  return res.json();
}

function extractSnapshot(doc: cheerio.CheerioAPI): string {
  return doc('main div[wire\\:snapshot]').attr("wire:snapshot")?.replace(/&quot;/g, '"') || "";
}

function extractToken(doc: cheerio.CheerioAPI): string {
  return doc('script[data-csrf]').attr("data-csrf") || "";
}

async function getMainPageItems(): Promise<Net27Item[]> {
  const html = await fetchPage(`${BASE}/anime`);
  const doc = cheerio.load(html);
  const snapshot = extractSnapshot(doc);
  const token = extractToken(doc);

  const result = await livewireRequest(token, snapshot, { sort: "release-desc" }, []);
  const comps = result?.components;
  if (!comps?.length) return [];

  const htmlStr = comps[0]?.effects?.html || "";
  const $ = cheerio.load(htmlStr);
  const items: Net27Item[] = [];
  $("div[wire\\:key]").each((_, el) => {
    const item = mapItem($(el));
    if (item) items.push(item);
  });
  return items;
}

export const anizoneProvider: ContentProvider = {
  id: "anizone",
  name: "AniZone",
  type: "direct",

  async fetchTrending(): Promise<Net27Item[]> {
    try {
      return await getMainPageItems();
    } catch {
      return [];
    }
  },

  async fetchHero(): Promise<Net27Item[]> {
    const items = await this.fetchTrending();
    return items.slice(0, 5);
  },

  async fetchDiscover(params?: { type?: string; sort?: string; genre?: string }): Promise<Net27Item[]> {
    return this.fetchTrending();
  },

  async fetchHomeCategories(): Promise<{ banners: Net27Item[]; categories: { title: string; items: Net27Item[] }[] }> {
    const items = await this.fetchTrending();
    return {
      banners: items.slice(0, 5),
      categories: [
        { title: "Latest Anime", items: items.slice(0, 20) },
      ],
    };
  },

  async search(query: string): Promise<Net27Item[]> {
    try {
      const html = await fetchPage(`${BASE}/anime`);
      const doc = cheerio.load(html);
      const snapshot = extractSnapshot(doc);
      const token = extractToken(doc);

      const result = await livewireRequest(token, snapshot, { search: query }, []);
      const comps = result?.components;
      if (!comps?.length) return [];

      const htmlStr = comps[0]?.effects?.html || "";
      const $ = cheerio.load(htmlStr);
      const items: Net27Item[] = [];
      $("div[wire\\:key]").each((_, el) => {
        const item = mapItem($(el));
        if (item) items.push(item);
      });
      return items;
    } catch {
      return [];
    }
  },

  async fetchTitleDetail(type: string, tmdbId: string, detailPath?: string): Promise<Net27TitleDetail | null> {
    if (!detailPath) return null;
    try {
      const html = await fetchPage(detailPath);
      const $ = cheerio.load(html);
      const title = $("h1").first().text().trim() || "";
      const poster = $("main img").first().attr("src") || "";
      const overview = $(".sr-only + div").text().trim() || "";
      const genres = $("a[wire\\:navigate][wire\\:key]").map((_, el) => ({ name: $(el).text().trim() })).get();

      const episodes: { episode: number; name: string; overview: string; still: string | null }[] = [];
      $("li[x-data]").each((i, el) => {
        episodes.push({
          episode: i + 1,
          name: $(el).find("h3").text().trim(),
          overview: "",
          still: $(el).find("img").attr("src") || null,
        });
      });

      return {
        title,
        type: "series",
        year: "",
        backdrop: poster || null,
        poster: poster || null,
        overview,
        rating: 0,
        runtime: 0,
        tagline: null,
        genres,
        cast: [],
        seasons: [{ season_number: 1, name: "Season 1", episode_count: episodes.length }],
        initialSeason: 1,
        initialEpisodes: episodes,
        recommendations: [],
        trailerKey: null,
        certification: null,
        catalog: null,
      };
    } catch {
      return null;
    }
  },

  async fetchEmbedSource(
    tmdbId: string,
    type: string,
    season?: number,
    episode?: number,
    dub?: string,
    detailPath?: string
  ): Promise<Net27EmbedResponse | null> {
    if (!detailPath) return null;
    try {
      const html = await fetchPage(detailPath);
      const $ = cheerio.load(html);
      const mediaPlayer = $("media-player").first();
      const m3u8 = mediaPlayer.attr("src") || "";
      const subs: { lang: string; name: string; url: string; source: string }[] = [];
      mediaPlayer.find("track").each((_, el) => {
        subs.push({
          lang: $(el).attr("label") || "en",
          name: $(el).attr("label") || "Subtitle",
          url: $(el).attr("src") || "",
          source: "anizone",
        });
      });

      if (!m3u8) return null;
      return {
        ok: true,
        tmdbId,
        title: $("h1").first().text().trim(),
        type,
        mp4: null,
        resolution: "1080",
        streams: [{ url: m3u8, resolution: 1080, size: 0 }],
        direct: true,
        cdn: "anizone",
        source: "anizone",
        mode: "direct",
        sig: "",
        exp: 0,
        subjectId: tmdbId,
        match: "exact",
        captions: subs,
        fallbackHls: m3u8,
      };
    } catch {
      return null;
    }
  },

  async fetchVariants(type: string, tmdbId: string, season?: number, episode?: number): Promise<Net27VariantsResponse | null> {
    return { variants: [{ dubSubjectId: tmdbId, language: "Original", isOriginal: true }], defaultSubjectId: tmdbId };
  },

  resolveStreamUrl(resp: Net27EmbedResponse, quality?: number): { url: string; mimeType: string } | null {
    if (!resp) return null;
    if (resp.streams && resp.streams.length > 0) {
      return { url: resp.streams[0].url, mimeType: "application/x-mpegURL" };
    }
    if (resp.fallbackHls) return { url: resp.fallbackHls, mimeType: "application/x-mpegURL" };
    return null;
  },

  resolveAllSources(resp: Net27EmbedResponse): StreamSource[] {
    if (!resp) return [];
    const sources: StreamSource[] = [];
    if (resp.streams) {
      for (const s of resp.streams) {
        sources.push({ label: `${s.resolution}p`, url: s.url, mimeType: "application/x-mpegURL", resolution: s.resolution });
      }
    }
    if (resp.fallbackHls && !sources.some((s) => s.url === resp.fallbackHls)) {
      sources.push({ label: "HLS", url: resp.fallbackHls, mimeType: "application/x-mpegURL", resolution: 0 });
    }
    return sources;
  },

  async fetchEpisodes(): Promise<{ episode: number; name: string; overview: string; still: string | null; runtime?: number }[]> {
    return [];
  },
};
