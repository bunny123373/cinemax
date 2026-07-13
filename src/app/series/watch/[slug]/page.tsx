"use client";

import { useCallback, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, Globe, Settings } from "lucide-react";
import Player from "@/components/Player";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tmdbId?: string; type?: string; season?: string; episode?: string }>;
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

export default function SeriesWatchPage({ params, searchParams }: Props) {
  const router = useRouter();
  const [slug, setSlug] = useState<string | null>(null);
  const [tmdbId, setTmdbId] = useState<number | null>(null);
  const [type, setType] = useState("tv");
  const [seasonNum, setSeasonNum] = useState(1);
  const [episodeNum, setEpisodeNum] = useState(1);
  const [title, setTitle] = useState("");
  const [sources, setSources] = useState<SourceOption[]>([]);
  const [selectedSource, setSelectedSource] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [autoPlayCountdown, setAutoPlayCountdown] = useState<number | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedDub, setSelectedDub] = useState<string | undefined>(undefined);
  const [showDubMenu, setShowDubMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  useEffect(() => {
    Promise.all([params, searchParams]).then(([p, sp]) => {
      setSlug(p.slug);
      setTmdbId(sp.tmdbId ? Number(sp.tmdbId) : null);
      setType(sp.type || "tv");
      setSeasonNum(parseInt(sp.season || "1"));
      setEpisodeNum(parseInt(sp.episode || "1"));
      setTitle(p.slug.replace(/-/g, " "));
    });
  }, [params, searchParams]);

  const loadEmbed = useCallback((tid: number, t: string, se: number, ep: number, dub?: string) => {
    setLoading(true);
    setError(false);
    setSources([]);
    setSelectedSource(0);
    const qs = new URLSearchParams({ type: t, se: String(se), ep: String(ep) });
    if (dub) qs.set("dub", dub);
    fetch(`/api/net27/embed/${tid}?${qs}`)
      .then((r) => r.json())
      .then((res) => {
        if (!res.ok) { setError(true); return; }
        setTitle(res.embed?.title || slug?.replace(/-/g, " ") || "");
        const srcs: SourceOption[] = res.sources || [];
        if (srcs.length === 0) { setError(true); return; }
        setSources(srcs);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!tmdbId) { setLoading(false); setError(true); return; }
    loadEmbed(tmdbId, type, seasonNum, episodeNum, selectedDub);
  }, [tmdbId, type, seasonNum, episodeNum, selectedDub, loadEmbed]);

  useEffect(() => {
    if (!tmdbId) return;
    fetch(`/api/net27/variants/${type}/${tmdbId}?se=${seasonNum}&ep=${episodeNum}`)
      .then((r) => r.json())
      .then((res) => { if (res.variants) setVariants(res.variants); })
      .catch(() => {});
  }, [tmdbId, type, seasonNum, episodeNum]);

  const handleEnded = useCallback(() => {
    setAutoPlayCountdown(10);
  }, []);

  useEffect(() => {
    if (autoPlayCountdown === null) return;
    if (autoPlayCountdown <= 0) {
      setAutoPlayCountdown(null);
      setEpisodeNum((prev) => prev + 1);
      return;
    }
    const timer = setTimeout(() => setAutoPlayCountdown(autoPlayCountdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [autoPlayCountdown]);

  const goToEpisode = (se: number, ep: number) => {
    setSeasonNum(se);
    setEpisodeNum(ep);
    router.push(`/series/watch/${slug}?tmdbId=${tmdbId}&type=${type}&season=${se}&episode=${ep}`);
  };

  const current = sources[selectedSource];

  if (loading && sources.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="animate-spin w-8 h-8 border-2 border-[#f5c542] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error && sources.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0f] gap-4">
        <p className="text-[#8e8ea0]">Stream not available</p>
        <Link href="/" className="text-[#f5c542] hover:underline">Go Home</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-20 bg-[#0a0a0f]">
      <div className="max-w-[1800px] mx-auto px-4 md:px-8 py-6">
        <Link
          href={tmdbId ? `/series/${slug}?tmdbId=${tmdbId}` : "/"}
          className="inline-flex items-center gap-2 text-[#8e8ea0] hover:text-[#f5c542] transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to series
        </Link>

        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            <p className="text-[#8e8ea0]">
              Season {seasonNum} &middot; Episode {episodeNum}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {variants.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => { setShowDubMenu(!showDubMenu); setShowQualityMenu(false); }}
                  className="flex items-center gap-2 px-3 py-2 bg-[#12121a] border border-[#2a2a3a] text-white text-sm hover:border-[#f5c542]/50 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  {selectedDub ? variants.find((v) => v.dubSubjectId === selectedDub)?.language || "Dub" : "Original"}
                </button>
                {showDubMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-[#12121a] border border-[#2a2a3a] shadow-xl z-50 min-w-[180px]">
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
                  className="flex items-center gap-2 px-3 py-2 bg-[#12121a] border border-[#2a2a3a] text-white text-sm hover:border-[#f5c542]/50 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  {current?.label || "Quality"}
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

        {current && (
          <div className="w-full aspect-video bg-black">
            <Player
              key={current.url}
              src={current.url}
              autoPlay
              onEnded={handleEnded}
            />
          </div>
        )}

        {sources.length > 1 && (
          <div className="mt-4 flex flex-wrap gap-2">
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

        {autoPlayCountdown !== null && (
          <div className="flex items-center justify-between mt-3 p-3 bg-[#12121a] border border-[#2a2a3a]">
            <p className="text-sm text-white">
              Next episode in <span className="text-[#f5c542] font-bold">{autoPlayCountdown}s</span>
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setAutoPlayCountdown(null)} className="text-xs text-[#8e8ea0] hover:text-white transition-colors">Cancel</button>
              <button
                onClick={() => { setAutoPlayCountdown(null); setEpisodeNum((prev) => prev + 1); }}
                className="text-xs text-[#f5c542] hover:underline"
              >
                Play now &rarr;
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-4 gap-4">
          <button
            onClick={() => goToEpisode(seasonNum, episodeNum - 1)}
            disabled={episodeNum <= 1 && seasonNum <= 1}
            className="flex items-center gap-2 px-4 py-2 border border-[#2a2a3a] text-white hover:border-[#f5c542]/30 transition-all text-sm bg-[#12121a] disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous Episode
          </button>
          <button
            onClick={() => goToEpisode(seasonNum, episodeNum + 1)}
            className="flex items-center gap-2 px-4 py-2 border border-[#2a2a3a] text-white hover:border-[#f5c542]/30 transition-all text-sm bg-[#12121a]"
          >
            Next Episode
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {variants.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-white mb-4">Available Languages</h2>
            <div className="flex flex-wrap gap-2">
              {variants.map((v) => (
                <button
                  key={v.dubSubjectId}
                  onClick={() => setSelectedDub(v.isOriginal ? undefined : v.dubSubjectId)}
                  className={`px-4 py-2 text-sm border transition-colors ${
                    (selectedDub === v.dubSubjectId || (v.isOriginal && !selectedDub))
                      ? "border-[#f5c542] text-[#f5c542] bg-[#f5c542]/10"
                      : "border-[#2a2a3a] text-white hover:border-[#f5c542]/30"
                  }`}
                >
                  {v.language}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
