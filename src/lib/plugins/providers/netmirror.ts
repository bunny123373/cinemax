import type { ContentProvider, StreamSource } from "../types";
import type { Net27Item, Net27TitleDetail, Net27EmbedResponse, Net27VariantsResponse } from "@/types/net27";

const MAIN_URL = "https://net52.cc";
const NET27_URL = "https://net27.cc";
const POSTER_CDN = "https://imgcdn.kim";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36";

let cachedCookie: { value: string; expiresAt: number } | null = null;

async function bypass(): Promise<string> {
  if (cachedCookie && Date.now() < cachedCookie.expiresAt) {
    return cachedCookie.value;
  }

  try {
    const res = await fetch(`${MAIN_URL}/verify.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Origin": "https://net77.cc",
        "Referer": "https://net77.cc/verify2",
      },
      body: `g-recaptcha-response=${crypto.randomUUID()}`,
      redirect: "manual",
      signal: AbortSignal.timeout(15000),
    });

    const setCookie = res.headers.get("set-cookie") || "";
    const match = setCookie.match(/t_hash_t=([^;]+)/);
    if (match) {
      const cookie = match[1];
      cachedCookie = { value: cookie, expiresAt: Date.now() + 15 * 60 * 60 * 1000 };
      return cookie;
    }
  } catch {}
  return "";
}

async function fetchWithBypass(url: string, opts: RequestInit = {}): Promise<Response> {
  const cookie = await bypass();
  const headers: Record<string, string> = {
    "User-Agent": "Mozilla/5.0 (Linux; Android 13; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.7559.132 Safari/537.36 /OS.Gatu v3.0",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "X-Requested-With": "XMLHttpRequest",
    ...(cookie ? { "Cookie": `t_hash_t=${cookie}` } : {}),
    ...((opts.headers as Record<string, string>) || {}),
  };

  return fetch(url, { ...opts, headers, signal: AbortSignal.timeout(15000), cache: "no-store" });
}

function posterUrl(id: string): string {
  return `${POSTER_CDN}/poster/v/${id}.jpg`;
}

function episodePosterUrl(id: string): string {
  return `${POSTER_CDN}/epimg/150/${id}.jpg`;
}

interface PostCategory {
  ids: string;
  cate: string;
}

interface SearchResult {
  id: string;
  t: string;
}

interface PostData {
  desc?: string;
  director?: string;
  ua?: string;
  episodes?: { complate: string; ep: string; id: string; s: string; t: string; time: string }[];
  genre?: string;
  match?: string;
  nextPage?: number;
  nextPageSeason?: string;
  nextPageShow?: number;
  season?: { ep: string; id: string; s: string; sele: string }[];
  title?: string;
  year?: string;
  cast?: string;
  runtime?: string;
  tmdb_id?: string;
}

function parseMainPageHtml(html: string): { title: string; items: { id: string }[] }[] {
  const categories: { title: string; items: { id: string }[] }[] = [];

  const sectionRegex = /<h2[^>]*>(.*?)<\/h2>([\s\S]*?)(?=<h2|$)/gi;
  let match;
  while ((match = sectionRegex.exec(html)) !== null) {
    const title = match[1].replace(/<[^>]+>/g, "").trim();
    const block = match[2];
    const items: { id: string }[] = [];
    const articleRegex = /data-post="([^"]+)"/gi;
    let artMatch;
    while ((artMatch = articleRegex.exec(block)) !== null) {
      items.push({ id: artMatch[1] });
    }
    if (items.length > 0 && title) {
      categories.push({ title, items });
    }
  }

  if (categories.length === 0) {
    const items: { id: string }[] = [];
    const articleRegex = /data-post="([^"]+)"/gi;
    let artMatch;
    while ((artMatch = articleRegex.exec(html)) !== null) {
      items.push({ id: artMatch[1] });
    }
    if (items.length > 0) {
      categories.push({ title: "Trending", items });
    }
  }

  return categories;
}

function mapToNet27Item(id: string, title?: string): Net27Item {
  return {
    tmdbId: id,
    title: title || "",
    year: "",
    poster: posterUrl(id),
    backdrop: posterUrl(id),
    overview: "",
    rating: 0,
    type: "movie",
    source: "netmirror",
  };
}

function parseRuntime(runtime?: string): number {
  if (!runtime) return 0;
  const hours = runtime.match(/(\d+)\s*h/);
  const minutes = runtime.match(/(\d+)\s*m/);
  return (hours ? parseInt(hours[1]) * 60 : 0) + (minutes ? parseInt(minutes[1]) : 0);
}

async function fetchPostDetail(id: string): Promise<PostData | null> {
  try {
    const res = await fetchWithBypass(`${MAIN_URL}/home/`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `action=get_post&id=${id}`,
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchEpisodesForSeason(seasonId: string, page: number = 1): Promise<{
  episodes: { complate: string; ep: string; id: string; s: string; t: string; time: string }[];
  nextPage: number;
}> {
  try {
    const res = await fetchWithBypass(`${MAIN_URL}/home/`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `action=get_episodes&id=${seasonId}&page=${page}`,
    });
    if (!res.ok) return { episodes: [], nextPage: 0 };
    const data = await res.json();
    return { episodes: data.episodes || [], nextPage: data.nextPage || 0 };
  } catch {
    return { episodes: [], nextPage: 0 };
  }
}

export const netmirrorProvider: ContentProvider = {
  id: "netmirror",
  name: "NetMirror",
  type: "direct",

  async fetchTrending(): Promise<Net27Item[]> {
    try {
      const res = await fetchWithBypass(`${MAIN_URL}/home`);
      const html = await res.text();
      const categories = parseMainPageHtml(html);
      const first = categories[0];
      if (!first) return [];
      return first.items.slice(0, 20).map((item) => mapToNet27Item(item.id));
    } catch {
      return [];
    }
  },

  async fetchHero(): Promise<Net27Item[]> {
    try {
      const res = await fetchWithBypass(`${MAIN_URL}/home`);
      const html = await res.text();
      const categories = parseMainPageHtml(html);
      const allItems = categories.flatMap((c) => c.items);
      return allItems.slice(0, 5).map((item) => mapToNet27Item(item.id));
    } catch {
      return [];
    }
  },

  async fetchDiscover(params = {}): Promise<Net27Item[]> {
    try {
      const res = await fetchWithBypass(`${MAIN_URL}/home`);
      const html = await res.text();
      const categories = parseMainPageHtml(html);
      const cat = categories.find((c) =>
        c.title.toLowerCase().includes(params.type || "") ||
        c.title.toLowerCase().includes("movie") ||
        c.title.toLowerCase().includes("series")
      );
      const items = cat?.items || categories[0]?.items || [];
      return items.slice(0, 30).map((item) => mapToNet27Item(item.id));
    } catch {
      return [];
    }
  },

  async fetchHomeCategories(): Promise<{
    banners: Net27Item[];
    categories: { title: string; items: Net27Item[] }[];
  }> {
    try {
      const res = await fetchWithBypass(`${MAIN_URL}/home`);
      const html = await res.text();
      const parsed = parseMainPageHtml(html);
      const banners = parsed[0]?.items.slice(0, 5).map((item) => mapToNet27Item(item.id)) || [];
      const categories = parsed.map((cat) => ({
        title: cat.title,
        items: cat.items.map((item) => mapToNet27Item(item.id)),
      }));
      return { banners, categories };
    } catch {
      return { banners: [], categories: [] };
    }
  },

  async search(query: string): Promise<Net27Item[]> {
    try {
      const res = await fetchWithBypass(`${MAIN_URL}/search.php?s=${encodeURIComponent(query)}`);
      const data = await res.json();
      const results: SearchResult[] = data.searchResult || [];
      return results.map((r) => mapToNet27Item(r.id, r.t));
    } catch {
      return [];
    }
  },

  async fetchTitleDetail(type: string, tmdbId: string, detailPath?: string): Promise<Net27TitleDetail | null> {
    try {
      const data = await fetchPostDetail(tmdbId);
      if (!data) return null;

      const isTv = type === "tv" || type === "series" || (data.season && data.season.length > 0);

      const genres = (data.genre || "").split(",").filter(Boolean).map((g) => ({ name: g.trim() }));
      const cast = (data.cast || "").split(",").filter(Boolean).map((name) => ({
        name: name.trim(),
        character: "",
        photo: null,
      }));

      const seasons = (data.season || []).map((s) => {
        const seasonNum = parseInt(s.s.replace(/[^0-9]/g, "")) || 0;
        return {
          season_number: seasonNum,
          name: s.sele || `Season ${seasonNum}`,
          episode_count: 0,
        };
      });

      const episodes = (data.episodes || []).map((ep) => ({
        episode: parseInt(ep.ep.replace(/[^0-9]/g, "")) || 0,
        name: ep.t,
        overview: "",
        still: ep.id ? episodePosterUrl(ep.id) : null,
      }));

      return {
        title: data.title || "",
        type: isTv ? "series" : "movie",
        year: data.year || "",
        backdrop: posterUrl(tmdbId),
        poster: posterUrl(tmdbId),
        overview: data.desc || "",
        rating: data.match ? parseFloat(data.match.replace(/[^0-9.]/g, "")) || 0 : 0,
        runtime: parseRuntime(data.runtime),
        tagline: null,
        genres,
        cast,
        seasons,
        initialSeason: 1,
        initialEpisodes: episodes,
        recommendations: [],
        trailerKey: null,
        certification: data.ua ? { rating: data.ua } : null,
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
    try {
      const data = await fetchPostDetail(tmdbId);
      if (!data) return null;

      const episodeList = data.episodes || [];
      const seasonList = data.season || [];

      let targetEpisode = episodeList[0];
      if (season && episode && seasonList.length > 0) {
        const seasonData = seasonList.find((s) => {
          const sNum = parseInt(s.s.replace(/[^0-9]/g, ""));
          return sNum === season;
        });
        if (seasonData) {
          const eps = await fetchEpisodesForSeason(seasonData.id);
          targetEpisode = eps.episodes.find((e) => {
            const epNum = parseInt(e.ep.replace(/[^0-9]/g, ""));
            return epNum === (episode || 1);
          }) || eps.episodes[0];
        }
      } else if (episode && episodeList.length > 0) {
        targetEpisode = episodeList.find((e) => {
          const epNum = parseInt(e.ep.replace(/[^0-9]/g, ""));
          return epNum === episode;
        }) || episodeList[0];
      }

      if (!targetEpisode) return null;

      const embedId = targetEpisode.id;

      const streamRes = await fetch(`${NET27_URL}/wefeed-h5-server/subject/play?subject_id=${embedId}`, {
        headers: { "Accept": "application/json", "User-Agent": UA },
        signal: AbortSignal.timeout(15000),
        cache: "no-store",
      });

      if (!streamRes.ok) {
        return {
          ok: false, tmdbId, title: data.title || "", type, mp4: null, resolution: "0",
          streams: null, direct: false, cdn: "netmirror", source: "netmirror",
          mode: "iframe", sig: "", exp: 0, subjectId: tmdbId, match: "none",
          captions: [], fallbackHls: null,
        };
      }

      const streamData = await streamRes.json();

      const streams: { url: string; resolution: number; size: number }[] = [];
      const mp4 = streamData.mp4 || null;

      if (streamData.streams) {
        for (const s of streamData.streams) {
          streams.push({ url: s.url, resolution: s.resolution || 1080, size: 0 });
        }
      }

      const captions = (streamData.captions || []).map((c: any) => ({
        lang: c.lang || "en",
        name: c.name || c.lang || "Subtitle",
        url: c.url || "",
        source: "netmirror",
      }));

      return {
        ok: streams.length > 0 || !!mp4,
        tmdbId,
        title: data.title || "",
        type,
        mp4,
        resolution: streams[0] ? String(streams[0].resolution) : "0",
        streams: streams.length > 0 ? streams : null,
        direct: streams.length > 0 || !!mp4,
        cdn: "netmirror",
        source: "netmirror",
        mode: streams.length > 0 || !!mp4 ? "direct" : "iframe",
        sig: "",
        exp: 0,
        subjectId: embedId,
        match: "exact",
        captions,
        fallbackHls: null,
      };
    } catch {
      return null;
    }
  },

  async fetchVariants(
    type: string,
    tmdbId: string,
    season?: number,
    episode?: number
  ): Promise<Net27VariantsResponse | null> {
    return {
      variants: [{ dubSubjectId: tmdbId, language: "Original", isOriginal: true }],
      defaultSubjectId: tmdbId,
    };
  },

  resolveStreamUrl(resp: Net27EmbedResponse, quality?: number): { url: string; mimeType: string } | null {
    if (!resp) return null;
    if (resp.streams && resp.streams.length > 0) {
      const sorted = [...resp.streams].sort((a, b) => b.resolution - a.resolution);
      let chosen = sorted[0];
      if (quality) {
        const match = sorted.find((s) => s.resolution === quality);
        if (match) chosen = match;
      }
      const mimeType = chosen.url.includes(".m3u8")
        ? "application/x-mpegURL"
        : chosen.url.includes(".mpd")
          ? "application/dash+xml"
          : "video/mp4";
      return { url: chosen.url, mimeType };
    }
    if (resp.mp4) return { url: resp.mp4, mimeType: "video/mp4" };
    if (resp.fallbackHls) return { url: resp.fallbackHls, mimeType: "application/x-mpegURL" };
    return null;
  },

  resolveAllSources(resp: Net27EmbedResponse): StreamSource[] {
    if (!resp) return [];
    const sources: StreamSource[] = [];
    if (resp.streams) {
      const sorted = [...resp.streams].sort((a, b) => b.resolution - a.resolution);
      for (const s of sorted) {
        const mimeType = s.url.includes(".m3u8")
          ? "application/x-mpegURL"
          : s.url.includes(".mpd")
            ? "application/dash+xml"
            : "video/mp4";
        sources.push({ label: `${s.resolution}p`, url: s.url, mimeType, resolution: s.resolution });
      }
    }
    if (resp.mp4) {
      if (!sources.some((s) => s.url === resp.mp4)) {
        sources.push({
          label: `${resp.resolution || "480"}p (MP4)`,
          url: resp.mp4,
          mimeType: "video/mp4",
          resolution: parseInt(resp.resolution) || 480,
        });
      }
    }
    if (resp.fallbackHls && !sources.some((s) => s.url === resp.fallbackHls)) {
      sources.push({ label: "HLS (Fallback)", url: resp.fallbackHls, mimeType: "application/x-mpegURL", resolution: 0 });
    }
    return sources;
  },

  async fetchEpisodes(
    type: string,
    tmdbId: string,
    season: number
  ): Promise<{ episode: number; name: string; overview: string; still: string | null; runtime?: number }[]> {
    try {
      const data = await fetchPostDetail(tmdbId);
      if (!data) return [];

      const seasonList = data.season || [];
      const seasonData = seasonList.find((s) => {
        const sNum = parseInt(s.s.replace(/[^0-9]/g, ""));
        return sNum === season;
      });

      if (!seasonData) {
        return (data.episodes || []).map((ep) => ({
          episode: parseInt(ep.ep.replace(/[^0-9]/g, "")) || 0,
          name: ep.t,
          overview: "",
          still: ep.id ? episodePosterUrl(ep.id) : null,
        }));
      }

      let allEpisodes: { complate: string; ep: string; id: string; s: string; t: string; time: string }[] = [];
      let nextPage = 1;
      while (nextPage > 0) {
        const result = await fetchEpisodesForSeason(seasonData.id, nextPage);
        allEpisodes = allEpisodes.concat(result.episodes);
        nextPage = result.nextPage;
      }

      return allEpisodes.map((ep) => ({
        episode: parseInt(ep.ep.replace(/[^0-9]/g, "")) || 0,
        name: ep.t,
        overview: "",
        still: ep.id ? episodePosterUrl(ep.id) : null,
      }));
    } catch {
      return [];
    }
  },
};
