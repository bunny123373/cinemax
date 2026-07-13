"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Settings, Globe } from "lucide-react";
import Player from "@/components/Player";
import { saveContinueWatching } from "@/lib/storage";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tmdbId?: string; type?: string }>;
}

interface SourceOption {
  label: string;
  url: string;
  mimeType: string;
  resolution: number;
}

interface Variant {
  dubSubjectId: string;
  language: string;
  isOriginal: boolean;
}

export default function WatchMoviePage({ params, searchParams }: Props) {
  const [slug, setSlug] = useState<string | null>(null);
  const [tmdbId, setTmdbId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [sources, setSources] = useState<SourceOption[]>([]);
  const [selectedSource, setSelectedSource] = useState(0);
  const [captions, setCaptions] = useState<{ lang: string; label: string; url: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedDub, setSelectedDub] = useState<string | undefined>(undefined);
  const [showDubMenu, setShowDubMenu] = useState(false);

  useEffect(() => {
    Promise.all([params, searchParams]).then(([p, sp]) => {
      setSlug(p.slug);
      setTmdbId(sp.tmdbId ? Number(sp.tmdbId) : null);
      setTitle(p.slug.replace(/-/g, " "));
    });
  }, [params, searchParams]);

  const loadEmbed = useCallback((tid: number, dub?: string) => {
    setLoading(true);
    setError(false);
    setSources([]);
    const qs = new URLSearchParams({ type: "movie" });
    if (dub) qs.set("dub", dub);
    fetch(`/api/net27/embed/${tid}?${qs}`)
      .then((r) => r.json())
      .then((res) => {
        if (!res.ok) { setError(true); return; }
        setTitle(res.embed?.title || slug?.replace(/-/g, " ") || "");
        const srcs: SourceOption[] = res.sources || [];
        if (srcs.length === 0) { setError(true); return; }
        setSources(srcs);
        setSelectedSource(0);
        setCaptions((res.captions || []).map((c: any) => ({ lang: c.lang, label: c.name || c.lang, url: c.url })));
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!tmdbId) { setLoading(false); setError(true); return; }
    loadEmbed(tmdbId, selectedDub);
  }, [tmdbId, selectedDub, loadEmbed]);

  useEffect(() => {
    if (!tmdbId) return;
    fetch(`/api/net27/variants/movie/${tmdbId}`)
      .then((r) => r.json())
      .then((res) => { if (res.variants) setVariants(res.variants); })
      .catch(() => {});
  }, [tmdbId]);

  const current = sources[selectedSource];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="animate-spin w-8 h-8 border-2 border-[#f5c542] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !current) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0f] gap-4">
        <p className="text-[#8e8ea0]">Stream not available</p>
        <Link href="/" className="text-[#f5c542] hover:underline">Go Home</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] overflow-hidden">
      <div className="w-full bg-[#0a0a0f]">
        <Link
          href={tmdbId ? `/movie/${slug}?tmdbId=${tmdbId}` : "/"}
          className="inline-flex items-center gap-1.5 text-[#8e8ea0] hover:text-[#f5c542] transition-colors px-3 py-2 text-xs"
        >
          <ArrowLeft className="w-3 h-3" />
          Back
        </Link>

        <div className="w-full aspect-video bg-black max-h-[50vh] sm:max-h-none">
          <Player
            key={current.url}
            src={current.url}
            autoPlay
            captions={captions}
            onProgress={(currentTime, duration) => {
              if (slug && tmdbId) {
                saveContinueWatching({
                  slug,
                  tmdbId,
                  type: "movie",
                  title,
                  poster: "",
                  currentTime,
                  duration,
                  updatedAt: Date.now(),
                });
              }
            }}
          />
        </div>

        <div className="px-3 sm:px-4 md:px-8 py-2 sm:py-3 md:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-3 mb-2 sm:mb-3">
            <h1 className="text-sm sm:text-lg md:text-2xl font-bold text-white truncate min-w-0">{title}</h1>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {variants.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => { setShowDubMenu(!showDubMenu); setShowQualityMenu(false); }}
                    className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-2 bg-[#12121a] border border-[#2a2a3a] text-white text-[10px] sm:text-sm hover:border-[#f5c542]/50 transition-colors"
                  >
                    <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{selectedDub ? variants.find((v) => v.dubSubjectId === selectedDub)?.language || "Dub" : "Original"}</span>
                    <span className="sm:hidden">Dub</span>
                  </button>
                  {showDubMenu && (
                    <div className="absolute right-0 top-full mt-1 bg-[#12121a] border border-[#2a2a3a] shadow-xl z-50 min-w-[160px]">
                      <button
                        onClick={() => { setSelectedDub(undefined); setShowDubMenu(false); }}
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-[#1a1a2e] transition-colors ${!selectedDub ? "text-[#f5c542]" : "text-white"}`}
                      >
                        Original
                      </button>
                      {variants.map((v) => (
                        <button
                          key={v.dubSubjectId}
                          onClick={() => { setSelectedDub(v.dubSubjectId); setShowDubMenu(false); }}
                          className={`block w-full text-left px-4 py-2 text-sm hover:bg-[#1a1a2e] transition-colors ${selectedDub === v.dubSubjectId ? "text-[#f5c542]" : "text-white"}`}
                        >
                          {v.language}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {sources.length > 1 && (
                <div className="relative">
                  <button
                    onClick={() => { setShowQualityMenu(!showQualityMenu); setShowDubMenu(false); }}
                    className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-2 bg-[#12121a] border border-[#2a2a3a] text-white text-[10px] sm:text-sm hover:border-[#f5c542]/50 transition-colors"
                  >
                    <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                    {current.label}
                  </button>
                  {showQualityMenu && (
                    <div className="absolute right-0 top-full mt-1 bg-[#12121a] border border-[#2a2a3a] shadow-xl z-50 min-w-[140px]">
                      {sources.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => { setSelectedSource(i); setShowQualityMenu(false); }}
                          className={`block w-full text-left px-4 py-2 text-sm hover:bg-[#1a1a2e] transition-colors ${i === selectedSource ? "text-[#f5c542]" : "text-white"}`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {sources.length > 1 && (
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {sources.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedSource(i)}
                  className={`px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-medium border transition-colors ${
                    i === selectedSource
                      ? "border-[#f5c542] text-[#f5c542] bg-[#f5c542]/10"
                      : "border-[#2a2a3a] text-[#8e8ea0] hover:border-[#f5c542]/30 hover:text-white"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
