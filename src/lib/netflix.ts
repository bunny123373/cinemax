import type {
  Net27Item,
  Net27TitleDetail,
  Net27EmbedResponse,
  Net27VariantsResponse,
} from "@/types/net27";

const H5_API_BASE = "https://h5-api.aoneroom.com";

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const res = await fetch(`${H5_API_BASE}/wefeed-h5api-bff/home`, {
    headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" },
    signal: AbortSignal.timeout(15000),
    cache: "no-store",
  });

  const xUser = res.headers.get("x-user");
  if (xUser) {
    const parsed = JSON.parse(xUser);
    if (parsed.token) {
      cachedToken = {
        token: parsed.token,
        expiresAt: Date.now() + 3 * 24 * 60 * 60 * 1000,
      };
      return parsed.token;
    }
  }

  const data = await res.json();
  const token = data?.data?.token || "";
  if (token) {
    cachedToken = { token, expiresAt: Date.now() + 3 * 24 * 60 * 60 * 1000 };
  }
  return token;
}

async function h5Request<T = any>(
  method: "GET" | "POST",
  path: string,
  params?: Record<string, string | number | undefined>,
  body?: Record<string, any>
): Promise<T> {
  const token = await getToken();
  let url = `${H5_API_BASE}${path}`;

  if (params) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== "") qs.set(k, String(v));
    }
    const qsStr = qs.toString();
    if (qsStr) url += `?${qsStr}`;
  }

  const headers: Record<string, string> = {
    "User-Agent": "Mozilla/5.0",
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`h5-api error: ${res.status} ${text.slice(0, 200)}`);
  }

  return res.json();
}

const GENRE_MAP: Record<string, string> = {
  "28": "Action", "12": "Adventure", "16": "Animation", "35": "Comedy",
  "80": "Crime", "99": "Documentary", "18": "Drama", "10751": "Family",
  "14": "Fantasy", "36": "History", "27": "Horror", "10402": "Music",
  "9648": "Mystery", "10749": "Romance", "878": "Science Fiction",
  "10770": "TV Movie", "53": "Thriller", "10752": "War", "37": "Western",
  "10759": "Action & Adventure", "10765": "Sci-Fi & Fantasy",
  "10768": "War & Politics",
};

interface H5Subject {
  subjectId: string;
  subjectType: number;
  title: string;
  description: string;
  releaseDate: string;
  duration: number;
  genre: string;
  cover?: { url: string; width?: number; height?: number };
  countryName: string;
  imdbRatingValue: string;
  subtitles: string;
  hasResource: boolean;
  detailPath: string;
  staffList?: any[];
  stills?: { url: string };
  corner?: string;
  dubs?: any[];
  season?: number;
  postTitle?: string;
}

interface H5ListResponse {
  code: number;
  message: string;
  data: {
    pager?: {
      hasMore: boolean;
      nextPage: string;
      page: string;
      perPage: string;
      totalCount: number;
    };
    items?: H5Subject[];
    subjectList?: H5Subject[];
  };
}

interface MBRawItem {
  subjectId?: string;
  title?: string;
  name?: string;
  cover?: any;
  poster?: string;
  backdrop?: string;
  year?: string;
  releaseDate?: string;
  imdbScore?: number;
  rating?: number;
  score?: number;
  imdbRatingValue?: string;
  type?: number | string;
  category?: number;
  intro?: string;
  description?: string;
  overview?: string;
  genre?: string;
  genres?: string[];
  tmdbId?: number;
  imdb_id?: string;
}

function mapSubject(item: H5Subject | MBRawItem): {
  tmdbId: string;
  title: string;
  year: string;
  poster: string | null;
  backdrop: string | null;
  overview: string;
  rating: number;
  type: string;
  detailPath: string;
} | null {
  if (!item) return null;

  const subjectId = (item as any).subjectId || "";
  const title = item.title || (item as any).name || "";
  if (!title || title.length < 2) return null;

  const tmdbId = subjectId || String((item as any).tmdbId || "");
  if (!tmdbId) return null;

  let poster: string | null = null;
  const cover = (item as any).cover;
  if (cover && typeof cover === "object" && cover.url) {
    poster = cover.url;
  } else if (typeof cover === "string") {
    poster = cover;
  } else if ((item as any).poster) {
    poster = (item as any).poster;
  }

  let backdrop: string | null = null;
  const stills = (item as any).stills;
  if (stills && typeof stills === "object" && stills.url) {
    backdrop = stills.url;
  } else if ((item as any).backdrop) {
    backdrop = (item as any).backdrop;
  } else if (poster) {
    backdrop = poster;
  }

  const rating = (item as any).imdbScore
    || (item as any).score
    || (item as any).rating
    || (item as any).imdbRatingValue
      ? parseFloat(String((item as any).imdbRatingValue || "0")) || 0
    : 0;

  let type = "movie";
  const st = (item as any).subjectType ?? (item as any).type;
  if (st === 2 || st === "2" || st === "tv" || st === "series") {
    type = "series";
  }

  if (!poster) return null;

  const overview = (item as any).intro || (item as any).description || (item as any).overview || "";
  const rd = (item as any).releaseDate || (item as any).year || "";
  const year = rd ? rd.split("-")[0] : "";

  return { tmdbId, title, year, poster, backdrop, overview, rating, type, detailPath: (item as any).detailPath || "" };
}

function extractSubjectId(title: string, path?: string): string {
  if (path) {
    const parts = path.split("-");
    const last = parts[parts.length - 1];
    if (last && /^\d+$/.test(last)) return last;
  }
  return "";
}

const subjectPathCache = new Map<string, string>();

async function fetchDetailPath(subjectId: string): Promise<string | null> {
  const cached = subjectPathCache.get(subjectId);
  if (cached) return cached;
  try {
    const trendingRes = await h5Request<any>("GET", "/wefeed-h5api-bff/subject/trending");
    const trending = trendingRes?.data?.subjectList || trendingRes?.data?.items || [];
    if (Array.isArray(trending)) {
      for (const item of trending) {
        if (item.detailPath) subjectPathCache.set(String(item.subjectId), item.detailPath);
      }
      const match = trending.find((i: any) => String(i.subjectId) === subjectId);
      if (match?.detailPath) return match.detailPath;
    }
  } catch {}
  try {
    const homeRes = await h5Request<any>("GET", "/wefeed-h5api-bff/home");
    const operatingList = homeRes?.data?.operatingList || [];
    for (const op of operatingList) {
      const subjects = op.subjects || op.banner?.items || [];
      for (const s of subjects) {
        const sub = s.subject || s;
        if (sub.detailPath) subjectPathCache.set(String(sub.subjectId), sub.detailPath);
        if (String(sub.subjectId) === subjectId && sub.detailPath) return sub.detailPath;
      }
    }
  } catch {}
  try {
    const recRes = await h5Request<any>("GET", "/wefeed-h5api-bff/subject/detail-rec", {
      subjectId, page: "1", perPage: "20",
    });
    const items = recRes?.data?.items || [];
    for (const item of items) {
      if (item.detailPath) subjectPathCache.set(String(item.subjectId), item.detailPath);
      if (String(item.subjectId) === subjectId && item.detailPath) return item.detailPath;
    }
  } catch {}
  return null;
}

export async function fetchTrending(): Promise<Net27Item[]> {
  try {
    const res = await h5Request<H5ListResponse>("GET", "/wefeed-h5api-bff/subject/trending");
    const items = res?.data?.subjectList || res?.data?.items || [];
    return (Array.isArray(items) ? items : []).map(mapSubject).filter(Boolean) as Net27Item[];
  } catch {
    return [];
  }
}

export async function fetchHero(): Promise<Net27Item[]> {
  try {
    const res = await h5Request<any>("GET", "/wefeed-h5api-bff/home");
    const operatingList = res?.data?.operatingList || [];
    const banner = operatingList.find((o: any) => o.type === "BANNER");
    if (banner?.banner?.items) {
      return banner.banner.items
        .map((item: any) => {
          const subject = item.subject || item;
          return mapSubject(subject);
        })
        .filter(Boolean) as Net27Item[];
    }
    return [];
  } catch {
    return [];
  }
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
  try {
    const typeMap: Record<string, number> = {
      movie: 1, tv: 2, series: 2,
    };
    const subjectType = params.type ? typeMap[params.type] || 1 : 1;

    const genreName = params.genre ? (GENRE_MAP[params.genre] || params.genre) : undefined;

    const body: Record<string, any> = {
      page: "1",
      perPage: "20",
      subjectType,
    };
    if (genreName) body.genre = genreName;

    const res = await h5Request<H5ListResponse>(
      "POST",
      "/wefeed-h5api-bff/subject/filter",
      undefined,
      body
    );
    const items = res?.data?.items || [];
    const desiredType = params.type === "tv" || params.type === "series" ? "series" : "movie";
    return (Array.isArray(items) ? items : [])
      .map(mapSubject)
      .filter((item) => item && item.type === desiredType) as Net27Item[];
  } catch {
    return [];
  }
}

export async function fetchHomeCategories(): Promise<{
  banners: Net27Item[];
  categories: { title: string; items: Net27Item[] }[];
}> {
  try {
    const res = await h5Request<any>("GET", "/wefeed-h5api-bff/home");
    const operatingList = res?.data?.operatingList || [];

    let banners: Net27Item[] = [];
    const categories: { title: string; items: Net27Item[] }[] = [];

    for (const op of operatingList) {
      if (op.type === "BANNER" && op.banner?.items) {
        banners = op.banner.items
          .map((item: any) => mapSubject(item.subject || item))
          .filter((item: any) => item && item.tmdbId && item.poster);
      } else if (op.type === "SUBJECTS_MOVIE" && op.subjects?.length > 0) {
        const items = op.subjects.map(mapSubject).filter((item: any) => item && item.tmdbId);
        if (items.length > 0) {
          categories.push({ title: op.title, items });
        }
      }
    }

    return { banners, categories };
  } catch {
    return { banners: [], categories: [] };
  }
}

export async function searchNet27(query: string): Promise<Net27Item[]> {
  try {
    const res = await h5Request<H5ListResponse>(
      "POST",
      "/wefeed-h5api-bff/subject/search",
      undefined,
      { keyword: query, page: "1", perPage: "30" }
    );
    const items = res?.data?.items || [];
    return (Array.isArray(items) ? items : []).map(mapSubject).filter(Boolean) as Net27Item[];
  } catch {
    return [];
  }
}

export async function fetchTitleDetail(type: string, tmdbId: string, detailPath?: string): Promise<Net27TitleDetail | null> {
  try {
    if (detailPath) {
      const token = await getToken();
      const res = await fetch(`${H5_API_BASE}/wefeed-h5api-bff/detail?detailPath=${encodeURIComponent(detailPath)}`, {
        headers: {
          "User-Agent": "Mozilla/5.0",
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal: AbortSignal.timeout(15000),
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        const d = data?.data;
        const sub = d?.subject;
        if (!sub) return null;

        const genreStr = sub.genre || "";
        const genres = genreStr.split(",").filter(Boolean).map((g: string) => ({ name: g.trim() }));

        const recItems = d?.postList?.items || [];
        const recs = recItems
          .slice(0, 10)
          .map((r: any) => mapSubject(r))
          .filter(Boolean);

        const seasons = (d?.resource?.seasons || []).map((s: any) => ({
          season_number: s.se,
          name: `Season ${s.se}`,
          episode_count: s.maxEp || 0,
        }));

        let poster = sub.cover?.url || null;
        let backdrop = sub.stills?.url || poster;

        const releaseYear = sub.releaseDate ? sub.releaseDate.split("-")[0] : "";

        let initialEpisodes: { episode: number; name: string; overview: string; still: string | null }[] = [];

        return {
          title: sub.title || "",
          type: type === "tv" || type === "series" ? "series" : "movie",
          year: releaseYear,
          backdrop,
          poster,
          overview: sub.description || "",
          rating: parseFloat(sub.imdbRatingValue) || 0,
          runtime: sub.duration ? Math.round(sub.duration / 60) : 0,
          tagline: null,
          genres,
          cast: (d?.stars || []).slice(0, 15).map((s: any) => ({
            name: s.name || "",
            character: s.character || "",
            photo: s.avatarUrl || null,
          })),
          seasons,
          initialSeason: 1,
          initialEpisodes,
          recommendations: recs as Net27Item[],
          trailerKey: sub.trailer?.videoAddress?.url || null,
          certification: null,
          catalog: { audioLangs: sub.subtitles ? sub.subtitles.split(",") : null },
        };
      }
    }

    const recRes = await h5Request<any>("GET", "/wefeed-h5api-bff/subject/detail-rec", {
      subjectId: tmdbId,
      page: "1",
      perPage: "12",
    });

    const items = recRes?.data?.items || [];
    const mainItem = items.find((i: any) => String(i.subjectId) === tmdbId) || items[0];
    if (!mainItem) return null;

    const genreStr = mainItem.genre || "";
    const genres = genreStr.split(",").filter(Boolean).map((g: string) => ({ name: g.trim() }));

    const recs = items
      .filter((i: any) => String(i.subjectId) !== tmdbId)
      .slice(0, 10)
      .map((r: any) => mapSubject(r))
      .filter(Boolean);

    let poster = null;
    if (mainItem.cover?.url) poster = mainItem.cover.url;
    let backdrop = mainItem.stills?.url || poster;

    const releaseYear = mainItem.releaseDate ? mainItem.releaseDate.split("-")[0] : "";

    return {
      title: mainItem.title || "",
      type: type === "tv" || type === "series" ? "series" : "movie",
      year: releaseYear,
      backdrop,
      poster,
      overview: mainItem.description || "",
      rating: parseFloat(mainItem.imdbRatingValue) || 0,
      runtime: mainItem.duration ? Math.round(mainItem.duration / 60) : 0,
      tagline: null,
      genres,
      cast: (mainItem.staffList || []).slice(0, 15).map((s: any) => ({
        name: s.name || "",
        character: s.character || "",
        photo: s.avatarUrl || null,
      })),
      seasons: [],
      initialSeason: 1,
      initialEpisodes: [],
      recommendations: recs as Net27Item[],
      trailerKey: null,
      certification: null,
      catalog: { audioLangs: mainItem.subtitles ? mainItem.subtitles.split(",") : null },
    };
  } catch {
    return null;
  }
}

export async function fetchEmbedSource(
  tmdbId: string,
  type: string,
  season?: number,
  episode?: number,
  dub?: string,
  detailPath?: string
): Promise<Net27EmbedResponse | null> {
  try {
    const params: Record<string, string> = {
      subjectId: tmdbId,
      se: String(season ?? 1),
      ep: String(episode ?? 1),
    };

    const res = await h5Request<any>("GET", "/wefeed-h5api-bff/subject/play", params);
    const d = res?.data;

    const hlsList = d?.hls || [];
    const dashList = d?.dash || [];
    const streamList = d?.streams || [];

    const allStreams: { url: string; resolution: number; size: number }[] = [];

    for (const s of streamList) {
      if (s.url) {
        allStreams.push({
          url: s.url,
          resolution: parseInt(s.resolution || s.quality || "1080") || 1080,
          size: s.fileSize || s.size || 0,
        });
      }
    }
    for (const h of hlsList) {
      if (h.url) {
        allStreams.push({
          url: h.url,
          resolution: parseInt(h.resolution || "1080") || 1080,
          size: 0,
        });
      }
    }
    for (const d2 of dashList) {
      if (d2.url) {
        allStreams.push({
          url: d2.url,
          resolution: parseInt(d2.resolution || "1080") || 1080,
          size: 0,
        });
      }
    }

    const firstStream = allStreams[0];
    const fallbackHls = hlsList.length > 0 ? hlsList[0].url : null;
    const hasStreams = allStreams.length > 0 || !!fallbackHls;

    return {
      ok: hasStreams,
      tmdbId,
      title: d?.title || "",
      type,
      mp4: d?.mp4 || (firstStream?.url?.includes(".mp4") ? firstStream.url : null),
      resolution: d?.resolution || "1080",
      streams: allStreams.length > 0 ? allStreams : null,
      direct: hasStreams,
      cdn: "aoneroom",
      source: "netflix",
      mode: hasStreams ? "direct" : "iframe",
      sig: "",
      exp: 0,
      subjectId: tmdbId,
      match: "exact",
      captions: (d?.subTitleList || d?.captions || []).map((c: any) => ({
        lang: c.language || c.lang || "en",
        name: c.language || c.lang || "Subtitle",
        url: c.url || "",
        source: "netflix",
      })),
      fallbackHls,
    } as Net27EmbedResponse;
  } catch {
    return null;
  }
}

export async function fetchVariants(
  type: string,
  tmdbId: string,
  season?: number,
  episode?: number
): Promise<Net27VariantsResponse | null> {
  try {
    const detail = await fetchTitleDetail(type, tmdbId);
    const dubs = detail?.catalog?.audioLangs || [];
    const variants = dubs.slice(0, 5).map((lang, i) => ({
      dubSubjectId: tmdbId,
      language: lang.trim(),
      isOriginal: i === 0,
    }));

    if (variants.length === 0) {
      variants.push({ dubSubjectId: tmdbId, language: "Original", isOriginal: true });
    }

    return { variants, defaultSubjectId: tmdbId };
  } catch {
    return { variants: [{ dubSubjectId: tmdbId, language: "Original", isOriginal: true }], defaultSubjectId: tmdbId };
  }
}

export async function fetchEpisodes(
  type: string,
  tmdbId: string,
  season: number
): Promise<{ episode: number; name: string; overview: string; still: string | null; runtime?: number }[]> {
  try {
    const detailRes = await fetchTitleDetail(type, tmdbId);
    if (!detailRes) return [];

    const seasonData = detailRes.seasons?.find((s) => s.season_number === season);
    const epCount = seasonData?.episode_count || 0;
    if (epCount === 0) return [];

    return Array.from({ length: epCount }, (_, i) => ({
      episode: i + 1,
      name: `Episode ${i + 1}`,
      overview: "",
      still: null,
      runtime: detailRes.runtime || undefined,
    }));
  } catch {
    return [];
  }
}

export function resolveStreamUrl(resp: Net27EmbedResponse, quality?: number): { url: string; mimeType: string } | null {
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
}

export function resolveAllSources(resp: Net27EmbedResponse): { label: string; url: string; mimeType: string; resolution: number }[] {
  if (!resp) return [];

  const sources: { label: string; url: string; mimeType: string; resolution: number }[] = [];

  if (resp.streams && resp.streams.length > 0) {
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
    const already = sources.some((s) => s.url.includes(resp.mp4!));
    if (!already) {
      sources.push({
        label: `${resp.resolution || "480"}p (MP4)`,
        url: resp.mp4,
        mimeType: "video/mp4",
        resolution: parseInt(resp.resolution) || 480,
      });
    }
  }

  if (resp.fallbackHls && !sources.some((s) => s.url.includes(resp.fallbackHls!))) {
    sources.push({ label: "HLS (Fallback)", url: resp.fallbackHls, mimeType: "application/x-mpegURL", resolution: 0 });
  }

  return sources;
}
