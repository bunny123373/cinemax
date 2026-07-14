const SPIDER_API_KEY = process.env.SPIDER_API_KEY;
const SPIDER_BASE = "https://api.spider.cloud";

export interface NetMirrorScrapeResult {
  title: string;
  url: string;
  content: string;
}

export async function scrapeNetMirror(url: string): Promise<NetMirrorScrapeResult | null> {
  if (!SPIDER_API_KEY) return null;
  try {
    const res = await fetch(`${SPIDER_BASE}/fetch/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SPIDER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        return_format: "json",
      }),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const page = data?.data?.[0] || data?.data || null;
    if (!page) return null;
    return {
      title: page.title || "",
      url: page.url || url,
      content: page.content || page.markdown || "",
    };
  } catch {
    return null;
  }
}

export async function scrapeNetMirrorSearch(query: string): Promise<NetMirrorScrapeResult[]> {
  if (!SPIDER_API_KEY) return [];
  try {
    const searchUrl = `https://netmirror.gg/search/${encodeURIComponent(query)}`;
    const result = await scrapeNetMirror(searchUrl);
    if (!result || !result.content) return [];

    const items: NetMirrorScrapeResult[] = [];
    const linkRegex = /\[([^\]]+)\]\((https?:\/\/netmirror\.gg[^)]+)\)/g;
    let match;
    while ((match = linkRegex.exec(result.content)) !== null) {
      items.push({
        title: match[1],
        url: match[2],
        content: "",
      });
    }
    return items;
  } catch {
    return [];
  }
}

export async function scrapeNetMirrorEmbed(tmdbId: number, type: string = "movie"): Promise<string | null> {
  if (!SPIDER_API_KEY) return null;
  const embedUrl = `https://netmirror.gg/embed?tmdb=${tmdbId}&type=${type}`;
  const result = await scrapeNetMirror(embedUrl);
  return result?.content || null;
}
