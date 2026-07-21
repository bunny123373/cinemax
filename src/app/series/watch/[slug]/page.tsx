"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, ChevronLeft, ChevronRight, Globe, Settings, Download, ArrowLeft as Back, Check, ListOrdered, X, Play } from "lucide-react";
import Player from "@/components/Player";
import StreamBoxEmbed from "@/components/StreamBoxEmbed";
import PreRollAd from "@/components/PreRollAd";
import DownloadGate from "@/components/DownloadGate";
import { saveContinueWatching, getContinueWatching } from "@/lib/storage";
import type { ContinueWatchingItem } from "@/types";

const NET27_BASE = "https://net27.cc";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tmdbId?: string; type?: string; season?: string; episode?: string; dub?: string }>;
}

interface SourceOption {
  label: string;
  url: string;
  mimeType: string;
  resolution: number;
  size?: number;
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
  const [captions, setCaptions] = useState<{ lang: string; label: string; url: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedDub, setSelectedDub] = useState<string | undefined>(undefined);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showDubMenu, setShowDubMenu] = useState(false);
  const [poster, setPoster] = useState("");
  const [embedData, setEmbedData] = useState<any>(null);

  const [downloadStep, setDownloadStep] = useState<"closed" | "pick-language" | "fetch-lang" | "pick-quality">("closed");
  const [downloadLang, setDownloadLang] = useState<{ label: string; dub?: string } | null>(null);
  const [downloadSources, setDownloadSources] = useState<SourceOption[]>([]);
  const [downloadEmbed, setDownloadEmbed] = useState<any>(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [showUpNext, setShowUpNext] = useState(false);
  const [showEpisodePanel, setShowEpisodePanel] = useState(false);
  const [showStreamBox, setShowStreamBox] = useState(false);
  const [adPlayed, setAdPlayed] = useState(false);
  const [showDownloadGate, setShowDownloadGate] = useState(false);
  const [episodeCount, setEpisodeCount] = useState(0);
  const [allSeasons, setAllSeasons] = useState<{ season_number: number; name: string; episode_count: number }[]>([]);
  const [continueWatching, setContinueWatching] = useState<ContinueWatchingItem[]>([]);
  const upNextTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    Promise.all([params, searchParams]).then(([p, sp]) => {
      setSlug(p.slug);
      setTmdbId(sp.tmdbId ? Number(sp.tmdbId) : null);
      setType(sp.type || "tv");
      setSeasonNum(parseInt(sp.season || "1"));
      setEpisodeNum(parseInt(sp.episode || "1"));
      setTitle(p.slug.replace(/-/g, " "));
      if (sp.dub) setSelectedDub(sp.dub);
    });
  }, [params, searchParams]);

  useEffect(() => {
    if (!tmdbId) return;
    fetch(`/api/tmdb/details/${tmdbId}?type=tv`)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((data) => { if (data.poster_path) setPoster(`https://image.tmdb.org/t/p/w500${data.poster_path}`); })
      .catch(() => {});
  }, [tmdbId]);

  const loadEmbed = useCallback((tid: number, t: string, se: number, ep: number, dub?: string) => {
    setLoading(true);
    setError(false);
    setSources([]);
    setSelectedSource(0);
    const qs = new URLSearchParams({ type: t, se: String(se), ep: String(ep) });
    if (dub) qs.set("dub", dub);
    fetch(`/api/net27/embed/${tid}?${qs}`)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((res) => {
        if (!res.ok) { setError(true); return; }
        setTitle(res.embed?.title || "");
        setEmbedData(res.embed);
        const srcs: SourceOption[] = (res.sources || []).map((s: any) => ({ ...s, size: s.size }));
        if (srcs.length === 0) { setError(true); return; }
        setSources(srcs);
        setCaptions((res.captions || []).map((c: { lang: string; name?: string; url: string }) => ({
          lang: c.lang,
          label: c.name || c.lang,
          url: c.url.startsWith("http") ? c.url : `${NET27_BASE}${c.url}`,
        })));
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!tmdbId) { setLoading(false); setError(true); return; }
    loadEmbed(tmdbId, type, seasonNum, episodeNum, selectedDub);
  }, [tmdbId, type, seasonNum, episodeNum, selectedDub, loadEmbed]);

  useEffect(() => {
    if (!tmdbId) return;
    fetch(`/api/net27/variants/${type}/${tmdbId}?se=${seasonNum}&ep=${episodeNum}`)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((res) => { if (res.variants) setVariants(res.variants); })
      .catch(() => {});
  }, [tmdbId, type, seasonNum, episodeNum]);

  useEffect(() => {
    if (!tmdbId) return;
    fetch(`/api/tmdb/details/${tmdbId}?type=tv`)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((data) => {
        const seasons = (data.seasons || []).filter((s: any) => s.season_number > 0);
        setAllSeasons(seasons);
        const cur = seasons.find((s: any) => s.season_number === seasonNum);
        if (cur) setEpisodeCount(cur.episode_count || 0);
      })
      .catch(() => {});
  }, [tmdbId, seasonNum]);

  const handleEpisodeEnd = useCallback(() => {
    setShowUpNext(true);
    upNextTimerRef.current = setTimeout(() => {
      goToEpisode(seasonNum, episodeNum + 1);
    }, 10000);
  }, [seasonNum, episodeNum]);

  const cancelUpNext = useCallback(() => {
    setShowUpNext(false);
    if (upNextTimerRef.current) {
      clearTimeout(upNextTimerRef.current);
      upNextTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => { if (upNextTimerRef.current) clearTimeout(upNextTimerRef.current); };
  }, []);

  const goToEpisode = (se: number, ep: number) => {
    setSeasonNum(se);
    setEpisodeNum(ep);
    const qs = new URLSearchParams({ tmdbId: String(tmdbId || ""), type, season: String(se), episode: String(ep) });
    router.push(`/series/watch/${slug}?${qs.toString()}`);
  };

  const openEpisodePanel = () => {
    setContinueWatching(getContinueWatching());
    setShowEpisodePanel(true);
  };

  const current = sources[selectedSource];

  function formatSize(bytes?: number) {
    if (!bytes) return "";
    if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} GB`;
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(0)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  }

  function handleDownload(url: string, label: string) {
    const name = title.replace(/[^a-zA-Z0-9\s\-_.()]/g, "").replace(/\s+/g, "_");
    const filename = `${name}_S${seasonNum}E${episodeNum}_${label}.mp4`.replace(/[\\/:*?"<>|]/g, "");
    const proxyUrl = `/api/download?${new URLSearchParams({ url, filename }).toString()}`;
    const a = document.createElement("a");
    a.href = proxyUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setDownloadStep("closed");
  }

  function openDownloadModal() {
    if (variants.length === 0) {
      setDownloadSources(sources.filter((s) => s.mimeType === "video/mp4"));
      setDownloadEmbed(embedData);
      setDownloadLang({ label: "Original" });
      setDownloadStep("pick-quality");
    } else {
      setDownloadStep("pick-language");
    }
  }

  async function fetchEmbedForLang(langLabel: string, dub?: string) {
    setDownloadLang({ label: langLabel, dub });
    setDownloadStep("fetch-lang");
    setDownloadLoading(true);
    try {
      const qs = new URLSearchParams({ type, se: String(seasonNum), ep: String(episodeNum) });
      if (dub) qs.set("dub", dub);
      const res = await fetch(`/api/net27/embed/${tmdbId}?${qs}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const srcs: SourceOption[] = (data.sources || []).filter((s: any) => s.mimeType === "video/mp4").map((s: any) => ({ ...s, size: s.size }));
      setDownloadSources(srcs);
      setDownloadEmbed(data.embed);
      setDownloadStep("pick-quality");
    } catch {
      setDownloadStep("closed");
    } finally {
      setDownloadLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0f] gap-4">
        <div className="animate-spin w-8 h-8 border-2 border-[#f5c542] border-t-transparent rounded-full" />
        <p className="text-sm text-[#8e8ea0]">Waiting for moment...</p>
      </div>
    );
  }

  if (error || !current) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <div className="max-w-[1800px] mx-auto px-3 md:px-8 py-4 md:py-6">
          <Link
            href={tmdbId ? `/series/${slug}?tmdbId=${tmdbId}` : "/"}
            className="inline-flex items-center gap-2 text-[#8e8ea0] hover:text-[#f5c542] transition-colors mb-3 md:mb-4 text-xs md:text-sm"
          >
            <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
            Back to series
          </Link>

          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-[#8e8ea0]">Stream not available for this episode</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setError(false); if (tmdbId) loadEmbed(tmdbId, type, seasonNum, episodeNum, selectedDub); }}
                className="px-4 py-2 text-sm border border-[#2a2a3a] text-white hover:border-[#f5c542]/30 transition-colors bg-[#12121a]"
              >
                Retry
              </button>
              <button
                onClick={() => goToEpisode(seasonNum, episodeNum - 1)}
                disabled={episodeNum <= 1 && seasonNum <= 1}
                className="px-4 py-2 text-sm border border-[#2a2a3a] text-white hover:border-[#f5c542]/30 transition-colors bg-[#12121a] disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4 inline mr-1" />Prev
              </button>
              <button
                onClick={() => goToEpisode(seasonNum, episodeNum + 1)}
                className="px-4 py-2 text-sm border border-[#2a2a3a] text-white hover:border-[#f5c542]/30 transition-colors bg-[#12121a]"
              >
                Next<ChevronRight className="w-4 h-4 inline ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const downloadModalOpen = downloadStep !== "closed";

  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      <div className="max-w-[1800px] mx-auto px-3 md:px-8 py-4 md:py-6">
        <Link
          href={tmdbId ? `/series/${slug}?tmdbId=${tmdbId}` : "/"}
          className="inline-flex items-center gap-2 text-[#8e8ea0] hover:text-[#f5c542] transition-colors mb-3 md:mb-4 text-xs md:text-sm"
        >
          <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
          Back to series
        </Link>

        <div className="w-full aspect-video bg-black">
          {!adPlayed ? (
            <PreRollAd onComplete={() => setAdPlayed(true)} duration={8} />
          ) : (
            <Player
              key={current.url}
              src={current.url}
              autoPlay
              captions={captions}
              dubOptions={variants.map((v) => ({ id: v.dubSubjectId, label: v.language }))}
              selectedDub={selectedDub || ""}
              onDubChange={(dubId) => { setSelectedDub(dubId); }}
              onProgress={(currentTime, duration) => {
                if (slug && tmdbId) {
                  saveContinueWatching({
                    slug,
                    tmdbId,
                    type: "series",
                    title,
                    poster: poster || "",
                    currentTime,
                    duration,
                    seasonNumber: seasonNum,
                    episodeNumber: episodeNum,
                    updatedAt: Date.now(),
                  });
                }
              }}
              onEnded={handleEpisodeEnd}
            />
          )}
        </div>

        <div className="mt-4 md:mt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 mb-4 md:mb-6">
            <div className="min-w-0">
              <h1 className="text-lg md:text-2xl font-bold text-white truncate">{title}</h1>
              <p className="text-xs md:text-sm text-[#8e8ea0]">
                Season {seasonNum} &middot; Episode {episodeNum}
              </p>
            </div>
            <div className="flex items-center gap-2 md:gap-3 overflow-x-auto scrollbar-hide pb-1">
              <button
                onClick={() => setShowDownloadGate(true)}
                className="flex items-center gap-2 px-3 py-2 bg-[#f5c542] text-[#0a0a0f] text-sm font-semibold hover:bg-[#e0b530] transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={openEpisodePanel}
                className="flex items-center gap-2 px-3 py-2 bg-[#12121a] border border-[#2a2a3a] text-white text-sm hover:border-[#f5c542]/50 transition-colors"
              >
                <ListOrdered className="w-4 h-4" />
                Episodes
              </button>
              {variants.length > 0 && (
                <button
                  onClick={() => setShowDubMenu(true)}
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
                    {current?.label || "Quality"}
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

          <div className="flex items-center justify-between mt-4 md:mt-6 gap-4">
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
        </div>
      </div>

      {downloadModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setDownloadStep("closed")}>
          <div
            className="bg-[#18181f] border border-[#2a2a3a] shadow-2xl w-full sm:max-w-[420px] sm:mx-4 rounded-t-2xl sm:rounded-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a3a]">
              <div className="flex items-center gap-3">
                {downloadStep === "pick-quality" && (
                  <button onClick={() => { setDownloadStep("pick-language"); setDownloadSources([]); }} className="text-[#8e8ea0] hover:text-white">
                    <Back className="w-4 h-4" />
                  </button>
                )}
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {downloadStep === "pick-language" && "Select Language"}
                    {downloadStep === "fetch-lang" && `Loading ${downloadLang?.label}...`}
                    {downloadStep === "pick-quality" && `${downloadLang?.label} Quality`}
                  </h3>
                  <p className="text-[11px] text-[#8e8ea0] mt-0.5 truncate max-w-[250px]">{title} — S{seasonNum}E{episodeNum}</p>
                </div>
              </div>
              <button onClick={() => setDownloadStep("closed")} className="text-[#8e8ea0] hover:text-white text-lg leading-none p-1">&times;</button>
            </div>

            {downloadStep === "pick-language" && (
              <div className="p-3 max-h-[350px] overflow-y-auto">
                <button
                  onClick={() => fetchEmbedForLang("Original")}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm rounded-lg hover:bg-[#f5c542]/10 transition-colors text-white group"
                >
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-[#8e8ea0] group-hover:text-[#f5c542]" />
                    Original
                  </div>
                  <Check className="w-4 h-4 text-[#f5c542] opacity-0 group-hover:opacity-100" />
                </button>
                {variants.map((v) => (
                  <button
                    key={v.dubSubjectId}
                    onClick={() => fetchEmbedForLang(v.language, v.dubSubjectId)}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm rounded-lg hover:bg-[#f5c542]/10 transition-colors text-white group"
                  >
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-[#8e8ea0] group-hover:text-[#f5c542]" />
                      {v.language}
                    </div>
                    <Check className="w-4 h-4 text-[#f5c542] opacity-0 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            )}

            {downloadStep === "fetch-lang" && (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="animate-spin w-6 h-6 border-2 border-[#f5c542] border-t-transparent rounded-full" />
                <p className="text-xs text-[#8e8ea0]">Fetching streams for {downloadLang?.label}...</p>
              </div>
            )}

            {downloadStep === "pick-quality" && (
              <div className="p-3 max-h-[350px] overflow-y-auto">
                {downloadSources.length > 0 ? (
                  downloadSources.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleDownload(s.url, s.label)}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm rounded-lg hover:bg-[#f5c542]/10 transition-colors text-white group"
                    >
                      <div className="flex items-center gap-3">
                        <Download className="w-4 h-4 text-[#8e8ea0] group-hover:text-[#f5c542]" />
                        {s.label}
                      </div>
                      <span className="text-xs text-[#8e8ea0]">
                        {formatSize(s.size) || s.mimeType.split("/")[1]}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-sm text-[#8e8ea0]">No MP4 sources available for this language</div>
                )}
                {downloadEmbed?.mp4 && (
                  <button
                    onClick={() => handleDownload(downloadEmbed.mp4, `${downloadEmbed.resolution || "480"}p`)}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm rounded-lg hover:bg-[#f5c542]/10 transition-colors text-[#f5c542] border-t border-[#2a2a3a] mt-1 group"
                  >
                    <div className="flex items-center gap-3">
                      <Download className="w-4 h-4 group-hover:text-[#e0b530]" />
                      Direct MP4
                    </div>
                    <span className="text-xs text-[#8e8ea0]">Recommended</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {showStreamBox && tmdbId && (
        <StreamBoxEmbed
          type="series"
          tmdbId={tmdbId}
          season={seasonNum}
          episode={episodeNum}
          title={title}
          onClose={() => setShowStreamBox(false)}
        />
      )}

      <DownloadGate
        open={showDownloadGate}
        onClose={() => setShowDownloadGate(false)}
        onVerified={() => setShowStreamBox(true)}
      />

      {showDubMenu && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowDubMenu(false)}>
          <div
            className="bg-[#18181f] border border-[#2a2a3a] shadow-2xl w-full sm:max-w-[420px] sm:mx-4 rounded-t-2xl sm:rounded-2xl animate-slide-up sm:animate-popup"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a3a]">
              <h3 className="text-sm font-semibold text-white">Select Language</h3>
              <button onClick={() => setShowDubMenu(false)} className="text-[#8e8ea0] hover:text-white text-lg leading-none p-1">&times;</button>
            </div>
            <div className="p-3 max-h-[350px] overflow-y-auto">
              <button
                onClick={() => { setSelectedDub(undefined); setShowDubMenu(false); }}
                className={`w-full text-left px-4 py-3 text-sm rounded-lg hover:bg-[#f5c542]/10 transition-colors group ${!selectedDub ? "text-[#f5c542] bg-[#f5c542]/5" : "text-white"}`}
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-[#8e8ea0] group-hover:text-[#f5c542]" />
                  Original
                </div>
              </button>
              {variants.map((v) => (
                <button
                  key={v.dubSubjectId}
                  onClick={() => { setSelectedDub(v.dubSubjectId); setShowDubMenu(false); }}
                  className={`w-full text-left px-4 py-3 text-sm rounded-lg hover:bg-[#f5c542]/10 transition-colors group ${selectedDub === v.dubSubjectId ? "text-[#f5c542] bg-[#f5c542]/5" : "text-white"}`}
                >
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-[#8e8ea0] group-hover:text-[#f5c542]" />
                    {v.language}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showUpNext && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#18181f] border border-[#2a2a3a] shadow-2xl w-full max-w-[400px] mx-4 rounded-2xl animate-popup overflow-hidden">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-[#8e8ea0] font-medium uppercase tracking-wider">Up Next</p>
                <button onClick={cancelUpNext} className="text-[#8e8ea0] hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-white font-semibold mb-1">Season {seasonNum} &middot; Episode {episodeNum + 1}</p>
              <p className="text-sm text-[#8e8ea0] mb-5">Starting in 10 seconds...</p>
              <div className="flex gap-3">
                <button
                  onClick={cancelUpNext}
                  className="flex-1 px-4 py-2.5 text-sm border border-[#2a2a3a] text-white hover:border-[#f5c542]/30 transition-colors bg-[#12121a]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { cancelUpNext(); goToEpisode(seasonNum, episodeNum + 1); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#f5c542] text-[#0a0a0f] text-sm font-semibold hover:bg-[#e0b530] transition-colors"
                >
                  <Play className="w-4 h-4" fill="#0a0a0f" />
                  Play Now
                </button>
              </div>
            </div>
            <div className="h-1 bg-[#2a2a3a]">
              <div className="h-full bg-[#f5c542] animate-upnext-countdown" />
            </div>
          </div>
        </div>
      )}

      {showEpisodePanel && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowEpisodePanel(false)}>
          <div
            className="bg-[#12121a] border border-[#2a2a3a] shadow-2xl w-full sm:max-w-[360px] sm:mx-4 rounded-t-2xl sm:rounded-2xl animate-slide-up max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a3a] shrink-0">
              <div>
                <h3 className="text-xs font-semibold text-white">Episodes</h3>
                <p className="text-[10px] text-[#8e8ea0] mt-0.5">{title}</p>
              </div>
              <button onClick={() => setShowEpisodePanel(false)} className="text-[#8e8ea0] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {allSeasons.length > 1 && (
              <div className="px-3 pt-2.5 pb-2 border-b border-[#2a2a3a]/50 shrink-0">
                <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1">
                  {allSeasons.map((s) => (
                    <button
                      key={s.season_number}
                      onClick={() => {
                        setSeasonNum(s.season_number);
                        setEpisodeCount(s.episode_count);
                        const qs = new URLSearchParams({ tmdbId: String(tmdbId || ""), type, season: String(s.season_number), episode: "1" });
                        router.push(`/series/watch/${slug}?${qs.toString()}`);
                        setShowEpisodePanel(false);
                      }}
                      className={`px-2.5 py-1 text-[10px] font-medium rounded-full whitespace-nowrap transition-colors ${
                        s.season_number === seasonNum
                          ? "bg-[#f5c542] text-[#0a0a0f]"
                          : "bg-[#1a1a26] text-[#8e8ea0] border border-[#2a2a3a] hover:border-[#f5c542]/30 hover:text-white"
                      }`}
                    >
                      S{s.season_number}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="overflow-y-auto p-3">
              <div className="grid grid-cols-6 sm:grid-cols-7 gap-1.5">
                {Array.from({ length: episodeCount || 20 }, (_, i) => {
                  const ep = i + 1;
                  const isCurrent = ep === episodeNum;
                  const cwItem = continueWatching.find(
                    (c) => c.slug === slug && c.seasonNumber === seasonNum && c.episodeNumber === ep
                  );
                  const progress = cwItem && cwItem.duration > 0
                    ? Math.min((cwItem.currentTime / cwItem.duration) * 100, 100)
                    : 0;
                  return (
                    <button
                      key={ep}
                      onClick={() => { setShowEpisodePanel(false); goToEpisode(seasonNum, ep); }}
                      className={`relative aspect-square flex items-center justify-center rounded-md text-xs font-bold transition-all overflow-hidden ${
                        isCurrent
                          ? "bg-[#f5c542] text-[#0a0a0f] shadow-lg shadow-[#f5c542]/20 scale-105"
                          : "bg-[#1a1a26] text-[#8e8ea0] border border-[#2a2a3a] hover:bg-[#22223a] hover:text-white hover:border-[#f5c542]/30"
                      }`}
                    >
                      {ep}
                      {isCurrent && (
                        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#f5c542] rounded-full border-1.5 border-[#12121a]" />
                      )}
                      {progress > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-black/40">
                          <div
                            className="h-full bg-[#f5c542]/80"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
