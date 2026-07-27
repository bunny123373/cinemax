import type { Net27Item, Net27TitleDetail, Net27EmbedResponse, Net27VariantsResponse } from "@/types/net27";

export interface StreamSource {
  label: string;
  url: string;
  mimeType: string;
  resolution: number;
  size?: number;
}

export interface ContentProvider {
  readonly id: string;
  readonly name: string;
  readonly type: "direct" | "meta";

  fetchTrending(): Promise<Net27Item[]>;
  fetchHero(): Promise<Net27Item[]>;
  fetchDiscover(params?: {
    type?: string;
    sort?: string;
    genre?: string;
  }): Promise<Net27Item[]>;
  fetchHomeCategories(): Promise<{
    banners: Net27Item[];
    categories: { title: string; items: Net27Item[] }[];
  }>;
  search(query: string): Promise<Net27Item[]>;
  fetchTitleDetail(
    type: string,
    tmdbId: string,
    detailPath?: string
  ): Promise<Net27TitleDetail | null>;
  fetchEmbedSource(
    tmdbId: string,
    type: string,
    season?: number,
    episode?: number,
    dub?: string,
    detailPath?: string
  ): Promise<Net27EmbedResponse | null>;
  fetchVariants(
    type: string,
    tmdbId: string,
    season?: number,
    episode?: number
  ): Promise<Net27VariantsResponse | null>;
  resolveStreamUrl(
    resp: Net27EmbedResponse,
    quality?: number
  ): { url: string; mimeType: string } | null;
  resolveAllSources(resp: Net27EmbedResponse): StreamSource[];
  fetchEpisodes(
    type: string,
    tmdbId: string,
    season: number
  ): Promise<{ episode: number; name: string; overview: string; still: string | null; runtime?: number }[]>;
}
