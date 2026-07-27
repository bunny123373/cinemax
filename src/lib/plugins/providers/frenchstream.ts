import type { ContentProvider, StreamSource } from "../types";
import type { Net27Item, Net27TitleDetail, Net27EmbedResponse, Net27VariantsResponse, Net27Season, Net27Episode, Net27Genre } from "@/types/net27";
import * as cheerio from "cheerio";

const BASE = "https://french-stream.one";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

const HEADERS: Record<string, string> = {
  "User-Agent": UA,
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
};

function toId(url: string): string {
  const m = url.match(/newsid=(\d+)/);
  if (m) return m[1];
  return url.replace(/[^a-z0-9]/gi, "_").slice(0, 60);
}

function toFull(url: string): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/")) return BASE + url;
  return url;
}

function mapResult(el: ReturnType<cheerio.CheerioAPI>, $: ReturnType<typeof cheerio.load>): Net27Item | null {
  const title = el.find(".short-title").text().trim() || "";
  let href = el.find("a.short-poster, a.img-box").first().attr("href") || "";
  if (!href) href = el.find("a").first().attr("href") || "";
  if (href.startsWith("/")) href = BASE + href;
  let poster = el.find("img").first().attr("src") || el.find("img").first().attr("data-src") || "";
  poster = toFull(poster);
  if (!title || !href) return null;

  const desc = el.find("span[id^='desc-']").text().trim() || "";
  const quality = el.find(".film-quality").text().trim() || "HD";

  return {
    tmdbId: toId(href),
    title,
    year: "",
    poster: poster || null,
    backdrop: poster || null,
    overview: desc,
    rating: 0,
    type: "movie",
    detailPath: href,
  };
}

async function fetchGet(url: string): Promise<string> {
  const res = await fetch(url, { headers: HEADERS, cache: "no-store", signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`FS ${res.status}`);
  return res.text();
}

export const frenchstreamProvider: ContentProvider = {
  id: "frenchstream",
  name: "FrenchStream",
  type: "direct",

  async fetchTrending(): Promise<Net27Item[]> {
    try {
      const html = await fetchGet(`${BASE}/films/page/1`);
      const $ = cheerio.load(html);
      const items: Net27Item[] = [];
      $(".short").each((_, el) => {
        const item = mapResult($(el), $);
        if (item) items.push(item);
      });
      return items;
    } catch { return []; }
  },

  async fetchHero(): Promise<Net27Item[]> {
    return (await this.fetchTrending()).slice(0, 5);
  },

  async fetchDiscover(params?: { type?: string; sort?: string; genre?: string }): Promise<Net27Item[]> {
    try {
      const path = params?.type === "tv" ? "s-tv/page/1" : "films/page/1";
      const html = await fetchGet(`${BASE}/${path}`);
      const $ = cheerio.load(html);
      const items: Net27Item[] = [];
      $(".short").each((_, el) => {
        const item = mapResult($(el), $);
        if (item) items.push(item);
      });
      return items;
    } catch { return []; }
  },

  async fetchHomeCategories(): Promise<{ banners: Net27Item[]; categories: { title: string; items: Net27Item[] }[] }> {
    const categories: { title: string; items: Net27Item[] }[] = [];
    const sections = [
      { path: "films/page/1", title: "Films" },
      { path: "s-tv/page/1", title: "Series" },
      { path: "netflix-series-/page/1", title: "Netflix" },
      { path: "series-apple-tv/page/1", title: "Apple TV+" },
      { path: "series-disney-plus/page/1", title: "Disney+" },
      { path: "serie-amazon-prime-videos/page/1", title: "Prime Video" },
    ];

    for (const sec of sections) {
      try {
        const html = await fetchGet(`${BASE}/${sec.path}`);
        const $ = cheerio.load(html);
        const items: Net27Item[] = [];
        $(".short").each((_, el) => {
          const item = mapResult($(el), $);
          if (item) items.push(item);
        });
        if (items.length > 0) categories.push({ title: sec.title, items: items.slice(0, 20) });
      } catch {}
    }

    const all = categories.flatMap((c) => c.items);
    return { banners: all.slice(0, 5), categories };
  },

  async search(query: string): Promise<Net27Item[]> {
    try {
      const html = await fetchGet(`${BASE}/index.php?story=${encodeURIComponent(query)}&do=search&subaction=search`);
      const $ = cheerio.load(html);
      const items: Net27Item[] = [];
      $(".short").each((_, el) => {
        const item = mapResult($(el), $);
        if (item) items.push(item);
      });
      return items;
    } catch { return []; }
  },

  async fetchTitleDetail(type: string, tmdbId: string, detailPath?: string): Promise<Net27TitleDetail | null> {
    if (!detailPath) return null;
    try {
      const html = await fetchGet(detailPath);
      const $ = cheerio.load(html);

      const fd = $("#film-data");
      const title = fd.attr("data-title") || $("h1#s-title").text().replace(/\s+/g, " ").trim();
      const poster = fd.attr("data-affiche") || $(".fposter img").attr("src") || "";
      const backdrop = fd.attr("data-affiche2") || poster;
      const trailerKey = fd.attr("data-trailer") || null;

      const rawDesc = $(".fdesc").first().text().trim() || "";
      const overview = rawDesc
        .replace(/^[\s\S]*?(Pour sauver[\s\S]*)$/i, "$1")
        .trim() || rawDesc.replace(/Résumé[\s\S]*?inscription\s*/, "").trim() || rawDesc;

      const genres: Net27Genre[] = [];
      $("a[href*='xfname=genre']").each((_, el) => {
        const name = $(el).text().trim();
        if (name) genres.push({ name });
      });

      const yearMatch = $("h1#s-title").text().match(/\d{4}/);
      const year = yearMatch ? yearMatch[0] : "";

      const isTv = type === "tv" || html.includes("season") || html.includes("serie");
      const isSeries = isTv || detailPath.includes("series") || detailPath.includes("serie");

      let seasons: Net27Season[] = [];
      let initialEpisodes: Net27Episode[] = [];

      const vidzyUrls = html.match(/https?:\/\/vidzy\.cc\/embed-[^\s"'<>]+/gi) || [];

      if (isSeries) {
        const seasonEls = $(".season-item, .seasons-list a, [data-season]");
        if (seasonEls.length > 0) {
          seasonEls.each((i, el) => {
            const num = i + 1;
            const name = $(el).text().trim() || `Season ${num}`;
            seasons.push({ season_number: num, name, episode_count: 0 });
          });
        } else {
          seasons.push({ season_number: 1, name: "Season 1", episode_count: vidzyUrls.length || 1 });
        }

        vidzyUrls.forEach((url, i) => {
          initialEpisodes.push({
            episode: i + 1,
            name: `Episode ${i + 1}`,
            overview: "",
            still: poster || null,
          });
        });
      }

      return {
        title,
        type: isSeries ? "series" : "movie",
        year,
        backdrop: toFull(backdrop) || null,
        poster: toFull(poster) || null,
        overview,
        rating: 0,
        runtime: 0,
        tagline: null,
        genres,
        cast: [],
        seasons,
        initialSeason: 1,
        initialEpisodes,
        recommendations: [],
        trailerKey,
        certification: null,
        catalog: null,
      };
    } catch { return null; }
  },

  async fetchEmbedSource(
    tmdbId: string,
    type: string,
    season?: number,
    episode?: number,
    _dub?: string,
    detailPath?: string
  ): Promise<Net27EmbedResponse | null> {
    if (!detailPath) {
      return {
        ok: false, tmdbId, title: "", type, mp4: null, resolution: "0",
        streams: null, direct: false, cdn: "frenchstream", source: "frenchstream",
        mode: "iframe", sig: "", exp: 0, subjectId: tmdbId, match: "none",
        captions: [], fallbackHls: null,
      };
    }

    try {
      const html = await fetchGet(detailPath);
      const $ = cheerio.load(html);

      const fd = $("#film-data");
      const title = fd.attr("data-title") || $("h1#s-title").text().replace(/\s+/g, " ").trim();

      const vidzyUrls = html.match(/https?:\/\/vidzy\.cc\/embed-[^\s"'<>]+/gi) || [];

      const epIndex = (episode || 1) - 1;
      const playerUrl = vidzyUrls[epIndex] || vidzyUrls[0] || "";

      const spaPlayerUrl = playerUrl || undefined;

      return {
        ok: !!playerUrl,
        tmdbId,
        title,
        type,
        mp4: null,
        resolution: "0",
        streams: null,
        direct: false,
        cdn: "frenchstream",
        source: "frenchstream",
        mode: "iframe",
        sig: "",
        exp: 0,
        subjectId: tmdbId,
        match: "none",
        captions: [],
        fallbackHls: null,
        spaPlayerUrl,
      };
    } catch {
      return {
        ok: false, tmdbId, title: "", type, mp4: null, resolution: "0",
        streams: null, direct: false, cdn: "frenchstream", source: "frenchstream",
        mode: "iframe", sig: "", exp: 0, subjectId: tmdbId, match: "none",
        captions: [], fallbackHls: null,
      };
    }
  },

  async fetchVariants(): Promise<Net27VariantsResponse | null> {
    return { variants: [], defaultSubjectId: "" };
  },

  resolveStreamUrl(): null { return null; },
  resolveAllSources(): StreamSource[] { return []; },
  async fetchEpisodes(): Promise<{ episode: number; name: string; overview: string; still: string | null; runtime?: number }[]> {
    return [];
  },
};
