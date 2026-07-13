export interface IContent {
  _id: string;
  tmdbId: number;
  type: "movie" | "series";
  title: string;
  slug: string;
  poster: string;
  banner: string;
  description: string;
  year: number;
  language: string;
  category: string;
  quality: string;
  rating: number;
  contentRating: string;
  tags: string[];
  cast: { name: string; character: string; profileImage: string }[];
  trailerEmbedUrl: string;
  hlsLink: string;
  embedIframeLink: string;
  peachifyId: string;
  downloadLink: string;
  netmirrorId: string;
  streams: { language: string; hlsLink: string; embedIframeLink: string }[];
  seasons?: Season[];
  featured?: boolean;
  createdAt: string;
}

export interface Season {
  seasonNumber: number;
  episodes: Episode[];
}

export interface Episode {
  episodeNumber: number;
  episodeTitle: string;
  hlsLink: string;
  embedIframeLink: string;
  peachifyId: string;
  netmirrorId: string;
  thumbnail: string;
  overview: string;
  quality: string;
  downloadLink: string;
  streams: { language: string; hlsLink: string; embedIframeLink: string }[];
}

export interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  media_type?: string;
}

export interface TmdbDetails {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  popularity: number;
  genres: { id: number; name: string }[];
  credits?: {
    cast: {
      id: number;
      name: string;
      character: string;
      profile_path: string;
      order: number;
    }[];
  };
  videos?: {
    results: {
      key: string;
      site: string;
      type: string;
    }[];
  };
  number_of_seasons?: number;
  seasons?: {
    season_number: number;
    name: string;
    episode_count: number;
  }[];
}

export interface ContinueWatchingItem {
  slug: string;
  type: "movie" | "series";
  title: string;
  poster: string;
  currentTime: number;
  duration: number;
  seasonNumber?: number;
  episodeNumber?: number;
  updatedAt: number;
}
