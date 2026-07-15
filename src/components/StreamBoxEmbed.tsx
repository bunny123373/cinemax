"use client";

import { useState } from "react";
import { X, Loader2, ExternalLink } from "lucide-react";

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
  const [failed, setFailed] = useState(false);

  const streamPath =
    type === "series" && season && episode
      ? `/stream/series/${tmdbId}/${season}/${episode}`
      : `/stream/movie/${tmdbId}`;

  const downloadPath =
    type === "series" && season && episode
      ? `/download/series/${tmdbId}/${season}/${episode}`
      : `/download/movie/${tmdbId}`;

  const streamUrl = `${STREAMBOX_BASE}${streamPath}?server=blaze&download=true&autoplay=false`;
  const downloadUrl = `${STREAMBOX_BASE}${downloadPath}`;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-[95%] h-[90vh] max-w-[1200px] bg-[#0a0a0f] border border-[#2a2a3a] flex flex-col animate-popup"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 bg-[#12121a] border-b border-[#2a2a3a]">
          <div className="flex items-center gap-3 min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">{title}</h3>
            <a
              href={streamUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-[#f5c542] text-[#0a0a0f] font-semibold hover:bg-[#e0b530] transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              Stream Now
            </a>
          </div>
          <button onClick={onClose} className="text-[#8e8ea0] hover:text-white ml-2">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 relative">
          {loading && !failed && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0f]">
              <Loader2 className="w-8 h-8 text-[#f5c542] animate-spin" />
            </div>
          )}
          {failed ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0f] gap-4 p-6 text-center">
              <p className="text-sm text-[#8e8ea0]">Download dashboard is not available for this title.</p>
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#f5c542] text-[#0a0a0f] text-sm font-semibold hover:bg-[#e0b530] transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open Download Page
              </a>
            </div>
          ) : (
            <iframe
              key={`${tmdbId}-${season || ""}-${episode || ""}`}
              src={downloadUrl}
              className="w-full h-full border-0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              onLoad={() => setLoading(false)}
              onError={() => setFailed(true)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
