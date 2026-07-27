import type { ContentProvider, StreamSource } from "../types";
import type { Net27Item, Net27TitleDetail, Net27EmbedResponse, Net27VariantsResponse } from "@/types/net27";
import * as cheerio from "cheerio";

const BASE = "https://anime-sama.to";

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
};

function toId(url: string): string {
  return url.replace(/[^a-z0-9]/gi, "_").slice(0, 60);
}

function mapCard(el: any, $: cheerio.CheerioAPI): Net27Item | null {
  const a = el.find("a").first();
  const img = el.find("img").first();
  const title = el.find(".card-title").text().trim() || img.attr("alt") || "";
  const href = a.attr("href") || "";
  const poster = img.attr("src") || "";
  if (!title || !href) return null;
  const fullUrl = href.startsWith("http") ? href : BASE + "/" + href.replace(/^\//, "");
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

async function fetchPage(url: string, opts?: { method?: string; body?: URLSearchParams }): Promise<string> {
  const init: RequestInit = {
    method: opts?.method || "GET",
    headers: HEADERS,
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  };
  if (opts?.body) init.body = opts.body;
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`AnimeSama ${res.status}`);
  return res.text();
}

async function getHomepage(): Promise<Net27Item[]> {
  const html = await fetchPage(BASE);
  const $ = cheerio.load(html);
  const items: Net27Item[] = [];
  $("#containerAjoutsAnimes a, #containerSorties a, #containerClassiques a, #containerPepites a").each((_, el) => {
    const item = mapCard($(el), $);
    if (item) items.push(item);
  });
  return items;
}

export const animesamaProvider: ContentProvider = {
  id: "animesama",
  name: "AnimeSama",
  type: "direct",

  async fetchTrending(): Promise<Net27Item[]> {
    try {
      return await getHomepage();
    } catch {
      return [];
    }
  },

  async fetchHero(): Promise<Net27Item[]> {
    const items = await this.fetchTrending();
    return items.slice(0, 5);
  },

  async fetchDiscover(): Promise<Net27Item[]> {
    return this.fetchTrending();
  },

  async fetchHomeCategories(): Promise<{ banners: Net27Item[]; categories: { title: string; items: Net27Item[] }[] }> {
    const items = await this.fetchTrending();
    return {
      banners: items.slice(0, 5),
      categories: [
        { title: "Derniers épisodes ajoutés", items: items.slice(0, 20) },
      ],
    };
  },

  async search(query: string): Promise<Net27Item[]> {
    try {
      const body = new URLSearchParams({ query });
      const html = await fetchPage(`${BASE}/template-php/defaut/fetch.php`, { method: "POST", body });
      const $ = cheerio.load(html);
      const items: Net27Item[] = [];
      $("a").each((_, el) => {
        const a = $(el);
        const title = a.find(".asn-search-result-title").text().trim() || a.text().trim();
        const href = a.attr("href") || "";
        const poster = a.find("img").attr("src") || "";
        if (!title || !href) return;
        items.push({
          tmdbId: toId(href),
          title,
          year: "",
          poster: poster || null,
          backdrop: poster || null,
          overview: "",
          rating: 0,
          type: "series",
          detailPath: href.startsWith("http") ? href : BASE + "/" + href.replace(/^\//, ""),
        });
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
      const title = $("#titreOeuvre").text().trim() || "";
      const poster = $("#coverOeuvre").attr("src") || "";
      const overview = $("p.text-sm.text-gray-400.mt-2").text().trim() || "";
      const genres = $("a.text-sm.text-gray-300.mt-2").text().split(",").map((g) => ({ name: g.trim() })).filter((g) => g.name);

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
        seasons: [],
        initialSeason: 1,
        initialEpisodes: [],
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
    return {
      ok: false,
      tmdbId,
      title: "",
      type,
      mp4: null,
      resolution: "0",
      streams: null,
      direct: false,
      cdn: "animesama",
      source: "animesama",
      mode: "iframe",
      sig: "",
      exp: 0,
      subjectId: tmdbId,
      match: "none",
      captions: [],
      fallbackHls: null,
    };
  },

  async fetchVariants(): Promise<Net27VariantsResponse | null> {
    return { variants: [], defaultSubjectId: "" };
  },

  resolveStreamUrl(): null {
    return null;
  },

  resolveAllSources(): StreamSource[] {
    return [];
  },

  async fetchEpisodes(): Promise<{ episode: number; name: string; overview: string; still: string | null; runtime?: number }[]> {
    return [];
  },
};
