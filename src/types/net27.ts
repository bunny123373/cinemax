export interface Net27Item {
  tmdbId: number;
  title: string;
  year: string;
  poster: string | null;
  backdrop: string | null;
  overview: string;
  rating: number;
  type: string;
  source?: string;
}

export interface Net27ListResponse {
  ok: boolean;
  items: Net27Item[];
}

export interface Net27Genre {
  name: string;
}

export interface Net27Cast {
  name: string;
  character: string;
  photo: string | null;
}

export interface Net27Season {
  season_number: number;
  name: string;
  episode_count: number;
}

export interface Net27Episode {
  episode: number;
  name: string;
  overview: string;
  still: string | null;
  airDate?: string;
  runtime?: number;
}

export interface Net27Cert {
  rating: string | null;
}

export interface Net27Catalog {
  audioLangs: string[] | null;
}

export interface Net27TitleDetail {
  title: string;
  type: string;
  year: string;
  backdrop: string | null;
  poster: string | null;
  overview: string;
  rating: number;
  runtime: number;
  tagline: string | null;
  genres: Net27Genre[];
  cast: Net27Cast[];
  seasons: Net27Season[];
  initialSeason: number;
  initialEpisodes: Net27Episode[];
  recommendations: Net27Item[];
  trailerKey: string | null;
  certification: Net27Cert | null;
  catalog: Net27Catalog | null;
}

export interface Net27Stream {
  url: string;
  resolution: number;
  size: number;
}

export interface Net27Caption {
  lang: string;
  name: string;
  url: string;
  source: string;
}

export interface Net27EmbedResponse {
  ok: boolean;
  tmdbId: number;
  title: string;
  type: string;
  mp4: string | null;
  resolution: string;
  streams: Net27Stream[] | null;
  direct: boolean;
  cdn: string;
  source: string;
  mode: string;
  sig: string;
  exp: number;
  subjectId: string;
  match: string;
  captions: Net27Caption[];
  fallbackHls: string | null;
}

export interface Net27Variant {
  dubSubjectId: string;
  language: string;
  isOriginal: boolean;
}

export interface Net27VariantsResponse {
  variants: Net27Variant[];
  defaultSubjectId: string;
}
