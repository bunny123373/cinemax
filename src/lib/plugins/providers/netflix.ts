import type { ContentProvider, StreamSource } from "../types";
import type { Net27Item, Net27TitleDetail, Net27EmbedResponse, Net27VariantsResponse } from "@/types/net27";
import {
  fetchTrending,
  fetchHero,
  fetchDiscover,
  fetchHomeCategories,
  searchNet27,
  fetchTitleDetail,
  fetchEmbedSource,
  fetchVariants,
  resolveStreamUrl,
  resolveAllSources,
  fetchEpisodes,
} from "@/lib/netflix";

export const netflixProvider: ContentProvider = {
  id: "netflix",
  name: "Netflix",
  type: "direct",

  fetchTrending,
  fetchHero,
  fetchDiscover,
  fetchHomeCategories,
  search: searchNet27,
  fetchTitleDetail,
  fetchEmbedSource,
  fetchVariants,
  resolveStreamUrl,
  resolveAllSources,
  fetchEpisodes,
};
