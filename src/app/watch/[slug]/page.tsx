"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Settings, Globe, Download, ExternalLink, ArrowLeft as Back, Check } from "lucide-react";
import Player from "@/components/Player";
import StreamBoxEmbed from "@/components/StreamBoxEmbed";
import { saveContinueWatching } from "@/lib/storage";

const NET27_BASE = "https://net27.cc";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tmdbId?: string; type?: string; dub?: string }>;
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
  const [showStreamBox, setShowStreamBox] = useState(false);
  const [poster, setPoster] = useState("");
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [showDubMenu, setShowDubMenu] = useState(false);
  const [embedData, setEmbedData] = useState<any>(null);

  // Download modal: closed | pick-language | fetch-lang | pick-quality
  const [downloadStep, setDownloadStep] = useState<"closed" | "pick-language" | "fetch-lang" | "pick-quality">("closed");
  const [downloadLang, setDownloadLang] = useState<{ label: string; dub?: string } | null>(null);
  const [downloadSources, setDownloadSources] = useState<SourceOption[]>([]);
  const [downloadEmbed, setDownloadEmbed] = useState<any>(null);
  const [downloadLoading, setDownloadLoading] = useState(false);

  useEffect(() => {
    Promise.all([params, searchParams]).then(([p, sp]) => {
      setSlug(p.slug);
      setTmdbId(sp.tmdbId ? Number(sp.tmdbId) : null);
      setTitle(p.slug.replace(/-/g, " "));
      if (sp.dub) setSelectedDub(sp.dub);
    });
  }, [params, searchParams]);

  useEffect(() => {
    if (!tmdbId) return;
    fetch(`/api/tmdb/details/${tmdbId}?type=movie`)
      .then((r) => r.json())
      .then((data) => { if (data.poster_path) setPoster(`https://image.tmdb.org/t/p/w500${data.poster_path}`); })
      .catch(() => {});
  }, [tmdbId]);

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
        setEmbedData(res.embed);
        const srcs: SourceOption[] = (res.sources || []).map((s: any) => ({ ...s, size: s.size }));
        if (srcs.length === 0) { setError(true); return; }
        setSources(srcs);
        setSelectedSource(0);
        setCaptions((res.captions || []).map((c: any) => ({
          lang: c.lang,
          label: c.name || c.lang,
          url: c.url.startsWith("http") ? c.url : `${NET27_BASE}${c.url}`,
        })));
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

  function formatSize(bytes?: number) {
    if (!bytes) return "";
    if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} GB`;
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(0)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  }

  function handleDownload(url: string, label: string) {
    const name = title.replace(/[^a-zA-Z0-9\s\-_.()]/g, "").replace(/\s+/g, "_");
    const filename = `${name}_${label}.mp4`.replace(/[\\/:*?"<>|]/g, "");
    const proxyUrl = `/api/download?${new URLSearchParams({ url, filename, referer: "https://netfilm.world/" }).toString()}`;
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
      // no dub options, go straight to quality
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
      const qs = new URLSearchParams({ type: "movie" });
      if (dub) qs.set("dub", dub);
      const res = await fetch(`/api/net27/embed/${tmdbId}?${qs}`);
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

  const downloadModalOpen = downloadStep !== "closed";

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
                  poster: poster || "",
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
            <div className="flex items-center gap-2 md:gap-3 overflow-x-auto scrollbar-hide pb-1">
              <button
                onClick={() => setShowStreamBox(true)}
                className="flex items-center gap-2 px-3 py-2 bg-[#1db954] text-white text-sm font-semibold hover:bg-[#1ed760] transition-colors"
              >
                <Download className="w-4 h-4" />
                Download 2
              </button>
              <button
                onClick={openDownloadModal}
                className="flex items-center gap-2 px-3 py-2 bg-[#f5c542] text-[#0a0a0f] text-sm font-semibold hover:bg-[#e0b530] transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
                <span className="text-[9px] font-normal opacity-70 ml-0.5">Recommended</span>
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
                    onClick={() => { setShowQualityMenu(!showQualityMenu); }}
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

      {downloadModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setDownloadStep("closed")}>
          <div
            className="bg-[#18181f] border border-[#2a2a3a] shadow-2xl w-full sm:max-w-[420px] sm:mx-4 rounded-t-2xl sm:rounded-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
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
                  <p className="text-[11px] text-[#8e8ea0] mt-0.5 truncate max-w-[250px]">{title}</p>
                </div>
              </div>
              <button onClick={() => setDownloadStep("closed")} className="text-[#8e8ea0] hover:text-white text-lg leading-none p-1">&times;</button>
            </div>

            {/* Step 1: Pick Language */}
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

            {/* Step 1.5: Loading */}
            {downloadStep === "fetch-lang" && (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="animate-spin w-6 h-6 border-2 border-[#f5c542] border-t-transparent rounded-full" />
                <p className="text-xs text-[#8e8ea0]">Fetching streams for {downloadLang?.label}...</p>
              </div>
            )}

            {/* Step 2: Pick Quality */}
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

      {showDubMenu && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowDubMenu(false)}>
          <div
            className="bg-[#18181f] border border-[#2a2a3a] shadow-2xl w-full sm:max-w-[420px] sm:mx-4 rounded-t-2xl sm:rounded-2xl animate-slide-up"
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

      {showStreamBox && tmdbId && (
        <StreamBoxEmbed
          type="movie"
          tmdbId={tmdbId}
          title={title}
          onClose={() => setShowStreamBox(false)}
        />
      )}
    </main>
  );
}
