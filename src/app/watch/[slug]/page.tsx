"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Settings, Globe, Download } from "lucide-react";
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
      <div className="min-h-screen bg-[#0a0a0f]">
        <div className="max-w-[1800px] mx-auto px-3 md:px-8 py-4 md:py-6">
          <Link
            href={tmdbId ? `/movie/${slug}?tmdbId=${tmdbId}` : "/"}
            className="inline-flex items-center gap-2 text-[#8e8ea0] hover:text-[#f5c542] transition-colors mb-3 md:mb-4 text-xs md:text-sm"
          >
            <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
            Back to details
          </Link>
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-[#8e8ea0]">Stream not available</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setError(false); if (tmdbId) loadEmbed(tmdbId, selectedDub); }}
                className="px-4 py-2 text-sm border border-[#2a2a3a] text-white hover:border-[#f5c542]/30 transition-colors bg-[#12121a]"
              >
                Retry
              </button>
              <Link href="/" className="px-4 py-2 text-sm border border-[#2a2a3a] text-[#f5c542] hover:border-[#f5c542]/30 transition-colors bg-[#12121a]">
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      <div className="max-w-[1800px] mx-auto px-3 md:px-8 py-4 md:py-6">
        <Link
          href={tmdbId ? `/movie/${slug}?tmdbId=${tmdbId}` : "/"}
          className="inline-flex items-center gap-2 text-[#8e8ea0] hover:text-[#f5c542] transition-colors mb-3 md:mb-4 text-xs md:text-sm"
        >
          <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
          Back to details
        </Link>

        <div className="w-full aspect-video bg-black">
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

        <div className="mt-4 md:mt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 mb-4 md:mb-6">
            <h1 className="text-lg md:text-2xl font-bold text-white truncate min-w-0">{title}</h1>
            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
              <button
                onClick={async () => {
                  try {
                    const res = await fetch(current.url);
                    const blob = await res.blob();
                    const ext = (current.mimeType || "").includes("mp4") ? ".mp4" : ".mp4";
                    const a = document.createElement("a");
                    a.href = URL.createObjectURL(blob);
                    a.download = `${title.replace(/[^a-zA-Z0-9\s\-_.()]/g, "").replace(/\s+/g, "_")}${ext}`;
                    a.click();
                    URL.revokeObjectURL(a.href);
                  } catch {}
                }}
                className="flex items-center gap-2 px-3 py-2 bg-[#f5c542] text-[#0a0a0f] text-sm font-semibold hover:bg-[#e0b530] transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              {variants.length > 0 && (
                <button
                  onClick={() => { setShowDubMenu(!showDubMenu); setShowQualityMenu(false); }}
                  className="flex items-center gap-2 px-3 py-2 bg-[#12121a] border border-[#2a2a3a] text-white text-sm hover:border-[#f5c542]/50 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  {selectedDub ? variants.find((v) => v.dubSubjectId === selectedDub)?.language || "Dub" : "Original"}
                </button>
              )}
              {sources.length > 1 && (
                <div className="relative">
                  <button
                    onClick={() => { setShowQualityMenu(!showQualityMenu); setShowDubMenu(false); }}
                    className="flex items-center gap-2 px-3 py-2 bg-[#12121a] border border-[#2a2a3a] text-white text-sm hover:border-[#f5c542]/50 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    {current.label}
                  </button>
                  {showQualityMenu && (
                    <div className="absolute right-0 top-full mt-1 bg-[#12121a] border border-[#2a2a3a] shadow-xl z-50 min-w-[160px]">
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
            <div className="flex flex-wrap gap-2">
              {sources.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedSource(i)}
                  className={`px-3 py-1.5 text-xs font-medium border transition-colors ${
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

      {showDubMenu && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowDubMenu(false)}>
          <div className="bg-[#18181f] border border-[#2a2a3a] shadow-2xl w-[90%] max-w-[360px] p-1 animate-popup" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a3a]">
              <h3 className="text-sm font-semibold text-white">Select Language</h3>
              <button onClick={() => setShowDubMenu(false)} className="text-[#8e8ea0] hover:text-white text-lg leading-none">&times;</button>
            </div>
            <div className="p-2">
              <button
                onClick={() => { setSelectedDub(undefined); setShowDubMenu(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-[#f5c542]/10 ${!selectedDub ? "text-[#f5c542] bg-[#f5c542]/5" : "text-white"}`}
              >
                Original
              </button>
              {variants.map((v) => (
                <button
                  key={v.dubSubjectId}
                  onClick={() => { setSelectedDub(v.dubSubjectId); setShowDubMenu(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-[#f5c542]/10 ${selectedDub === v.dubSubjectId ? "text-[#f5c542] bg-[#f5c542]/5" : "text-white"}`}
                >
                  {v.language}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
