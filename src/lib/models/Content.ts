import mongoose, { Schema, Document } from "mongoose";

export interface IContentDocument extends Document {
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
  tmdbId?: number;
  hlsLink: string;
  embedIframeLink: string;
  peachifyId: string;
  downloadLink: string;
  netmirrorId: string;
  streams: { language: string; hlsLink: string; embedIframeLink: string }[];
  seasons?: {
    seasonNumber: number;
    episodes: {
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
    }[];
  }[];
  featured?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const CastSchema = new Schema({
  name: { type: String, default: "" },
  character: { type: String, default: "" },
  profileImage: { type: String, default: "" },
}, { _id: false });

const EpisodeStreamSchema = new Schema({
  language: { type: String, default: "" },
  hlsLink: { type: String, default: "" },
  embedIframeLink: { type: String, default: "" },
}, { _id: false });

const EpisodeSchema = new Schema({
  episodeNumber: { type: Number, required: true },
  episodeTitle: { type: String, required: true },
  hlsLink: { type: String, default: "" },
  embedIframeLink: { type: String, default: "" },
  peachifyId: { type: String, default: "" },
  netmirrorId: { type: String, default: "" },
  thumbnail: { type: String, default: "" },
  overview: { type: String, default: "" },
  quality: { type: String, default: "1080p" },
  downloadLink: { type: String, default: "" },
  streams: [EpisodeStreamSchema],
}, { _id: false });

const SeasonSchema = new Schema({
  seasonNumber: { type: Number, required: true },
  episodes: [EpisodeSchema],
}, { _id: false });

const ContentStreamSchema = new Schema({
  language: { type: String, default: "" },
  hlsLink: { type: String, default: "" },
  embedIframeLink: { type: String, default: "" },
}, { _id: false });

const ContentSchema = new Schema({
  type: { type: String, enum: ["movie", "series"], required: true },
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  poster: { type: String, default: "" },
  banner: { type: String, default: "" },
  description: { type: String, default: "" },
  year: { type: Number, required: true },
  language: { type: String, default: "English" },
  category: { type: String, required: true },
  quality: { type: String, default: "1080p" },
  rating: { type: Number, default: 0 },
  contentRating: { type: String, default: "TV-MA" },
  tags: [{ type: String }],
  cast: [CastSchema],
  trailerEmbedUrl: { type: String, default: "" },
  hlsLink: { type: String, default: "" },
  embedIframeLink: { type: String, default: "" },
  tmdbId: { type: Number },
  peachifyId: { type: String, default: "" },
  downloadLink: { type: String, default: "" },
  netmirrorId: { type: String, default: "" },
  streams: [ContentStreamSchema],
  featured: { type: Boolean, default: false },
  seasons: [SeasonSchema],
}, {
  timestamps: true,
});

ContentSchema.index({ type: 1, rating: -1 });
ContentSchema.index({ type: 1, year: -1 });
ContentSchema.index({ tags: 1 });
ContentSchema.index({ language: 1 });
ContentSchema.index({ slug: 1 });

export const Content = mongoose.models.Content || mongoose.model<IContentDocument>("Content", ContentSchema);
