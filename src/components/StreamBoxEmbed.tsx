"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";

const STREAMBOX_BASE = "https://streambox.sonixhub.net";

interface StreamBoxEmbedProps {
  type: string;
  tmdbId: number;
  season?: number;
  episode?: number;
  title: string;
  onClose: () => void;
}

export default function StreamBoxEmbed({ type, tmdbId, season, episode, title, onClose }: StreamBoxEmbedProps) {
  const [loading, setLoading] = useState(true);

  const streamPath =
    type === "series" && season && episode
      ? `/stream/series/${tmdbId}/${season}/${episode}`
      : `/stream/movie/${tmdbId}`;

  const downloadPath =
    type === "series" && season && episode
      ? `/download/series/${tmdbId}/${season}/${episode}`
      : `/download/movie/${tmdbId}`;

  const [activeTab, setActiveTab] = useState<"stream" | "download">("download");

  const embedUrl =
    activeTab === "download"
      ? `${STREAMBOX_BASE}${downloadPath}`
      : `${STREAMBOX_BASE}${streamPath}?server=blaze&download=true&autoplay=false`;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-[95%] h-[90vh] max-w-[1200px] bg-[#0a0a0f] border border-[#2a2a3a] flex flex-col animate-popup"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 bg-[#12121a] border-b border-[#2a2a3a]">
          <div className="flex items-center gap-3 min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">{title}</h3>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab("download")}
                className={`px-3 py-1 text-xs font-medium transition-colors ${
                  activeTab === "download"
                    ? "bg-[#f5c542] text-[#0a0a0f]"
                    : "text-[#8e8ea0] hover:text-white"
                }`}
              >
                Downloads
              </button>
              <button
                onClick={() => setActiveTab("stream")}
                className={`px-3 py-1 text-xs font-medium transition-colors ${
                  activeTab === "stream"
                    ? "bg-[#f5c542] text-[#0a0a0f]"
                    : "text-[#8e8ea0] hover:text-white"
                }`}
              >
                Stream
              </button>
            </div>
          </div>
          <button onClick={onClose} className="text-[#8e8ea0] hover:text-white ml-2">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0f]">
              <Loader2 className="w-8 h-8 text-[#f5c542] animate-spin" />
            </div>
          )}
          <iframe
            key={`${activeTab}-${tmdbId}`}
            src={embedUrl}
            className="w-full h-full border-0"
            allowFullScreen
            onLoad={() => setLoading(false)}
          />
        </div>
      </div>
    </div>
  );
}
