"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import Hls from "hls.js";
import PlayerTitle from "./PlayerTitle";

interface PlayerProps {
  src: string;
  type?: "hls" | "dash" | "mp4" | "auto";
  poster?: string;
  title?: string;
  subtitle?: string;
  autoPlay?: boolean;
  startTime?: number;
  captions?: { lang: string; label: string; url: string }[];
  dubOptions?: { id: string; label: string }[];
  selectedDub?: string;
  onDubChange?: (dubId: string) => void;
  headers?: Record<string, string>;
  onProgress?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  onError?: () => void;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function detectType(src: string): string {
  if (src.includes(".m3u8")) return "application/x-mpegurl";
  if (src.includes(".mpd")) return "application/dash+xml";
  return "video/mp4";
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function Player({
  src,
  type,
  poster,
  title,
  subtitle,
  autoPlay,
  startTime,
  captions,
  onProgress,
  onEnded,
  onError,
}: PlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [keyboardHint, setKeyboardHint] = useState<string | null>(null);
  const [streamState, setStreamState] = useState<"loading" | "playing" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [activeTrack, setActiveTrack] = useState<string | null>(null);

  const flashHint = useCallback((text: string) => {
    setKeyboardHint(text);
    setTimeout(() => setKeyboardHint(null), 800);
  }, []);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!src) return;
    const video = videoRef.current;
    if (!video) return;

    setStreamState("loading");
    setBuffering(true);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const detectedType = type === "hls" ? "application/x-mpegurl"
      : type === "dash" ? "application/dash+xml"
      : type === "mp4" ? "video/mp4"
      : detectType(src);

    if (detectedType === "application/x-mpegurl" && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: false,
        backBufferLength: 90,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
      });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay) {
          video.muted = true;
          video.play().catch(() => {});
        }
      });
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal && mountedRef.current) {
          setStreamState("error");
          setErrorMsg(data.type === Hls.ErrorTypes.NETWORK_ERROR ? "Network error" : "Playback error");
          onError?.();
        }
      });
    } else if (detectedType === "application/dash+xml" && video.canPlayType("application/dash+xml")) {
      video.src = src;
      if (autoPlay) {
        video.muted = true;
        video.play().catch(() => {});
      }
    } else {
      video.src = src;
      if (autoPlay) {
        video.muted = true;
        video.play().catch(() => {});
      }
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, type]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => { if (mountedRef.current) { setPlaying(true); setStreamState("playing"); } };
    const onPause = () => { if (mountedRef.current) setPlaying(false); };
    const onWaiting = () => { if (mountedRef.current) setBuffering(true); };
    const onPlaying = () => { if (mountedRef.current) { setBuffering(false); setStreamState("playing"); } };
    const onTimeUpdate = () => {
      if (!mountedRef.current) return;
      setCurrentTime(video.currentTime);
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };
    const onDurationChange = () => { if (mountedRef.current) setDuration(video.duration); };
    const onEnded = () => { if (mountedRef.current) onEnded?.(); };
    const onLoadedMetadata = () => {
      if (mountedRef.current) {
        setDuration(video.duration);
        if (startTime && startTime > 0) {
          video.currentTime = startTime;
        }
      }
    };
    const onError = () => {
      if (mountedRef.current) {
        setStreamState("error");
        setErrorMsg("Stream unavailable");
        onError?.();
      }
    };

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("durationchange", onDurationChange);
    video.addEventListener("ended", onEnded);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("error", onError);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("durationchange", onDurationChange);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("error", onError);
    };
  }, [onEnded, onError, startTime]);

  useEffect(() => {
    if (!src || streamState === "error") return;
    const timer = setTimeout(() => {
      if (streamState === "loading" && mountedRef.current) {
        setStreamState("error");
        setErrorMsg("Stream timed out");
        onError?.();
      }
    }, 20000);
    return () => clearTimeout(timer);
  }, [src, streamState, onError]);

  useEffect(() => {
    if (streamState === "playing" && onProgress) {
      progressTimerRef.current = setInterval(() => {
        const video = videoRef.current;
        if (video && video.duration > 0 && video.currentTime > 0) {
          onProgress(video.currentTime, video.duration);
        }
      }, 5000);
    }
    return () => { if (progressTimerRef.current) clearInterval(progressTimerRef.current); };
  }, [streamState, onProgress]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) { video.play().catch(() => {}); flashHint("▶ Play"); }
    else { video.pause(); flashHint("⏸ Pause"); }
  }, [flashHint]);

  const seek = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
    flashHint(`${seconds > 0 ? "+" : ""}${seconds}s`);
  }, [flashHint]);

  const changeVolume = useCallback((delta: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = Math.max(0, Math.min(1, video.volume + delta));
    setVolume(video.volume);
    flashHint(`🔊 ${Math.round(video.volume * 100)}%`);
  }, [flashHint]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
    flashHint(video.muted ? "🔇 Muted" : "🔊 Unmuted");
  }, [flashHint]);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    if (document.fullscreenElement) { document.exitFullscreen(); }
    else { container.requestFullscreen(); }
  }, []);

  const changeSpeed = useCallback((rate: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
    flashHint(`${rate}x`);
  }, [flashHint]);

  const toggleSubtitles = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const tracks = Array.from(video.textTracks);
    const active = tracks.find((t) => t.mode === "showing");
    if (active) {
      active.mode = "hidden";
      setActiveTrack(null);
      flashHint("Subtitles Off");
    } else if (tracks.length > 0) {
      const first = tracks[0];
      if (first) { first.mode = "showing"; setActiveTrack(first.language); }
      flashHint("Subtitles On");
    }
  }, [flashHint]);

  const selectTrack = useCallback((lang: string) => {
    const video = videoRef.current;
    if (!video) return;
    const tracks = Array.from(video.textTracks);
    tracks.forEach((t) => { t.mode = t.language === lang ? "showing" : "hidden"; });
    setActiveTrack(lang);
    setShowSubtitleMenu(false);
    flashHint(lang ? `Sub: ${lang}` : "Subtitles Off");
  }, [flashHint]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault(); togglePlay(); break;
        case "ArrowLeft":
          e.preventDefault(); seek(-10); break;
        case "ArrowRight":
          e.preventDefault(); seek(10); break;
        case "ArrowUp":
          e.preventDefault(); changeVolume(0.1); break;
        case "ArrowDown":
          e.preventDefault(); changeVolume(-0.1); break;
        case "f": case "F":
          e.preventDefault(); toggleFullscreen(); break;
        case "m": case "M":
          e.preventDefault(); toggleMute(); break;
        case "c": case "C":
          e.preventDefault(); toggleSubtitles(); break;
        case "j": case "J":
          e.preventDefault(); seek(-10); break;
        case "l": case "L":
          e.preventDefault(); seek(10); break;
        case ">":
          e.preventDefault();
          { const idx = SPEEDS.indexOf(playbackRate);
          if (idx < SPEEDS.length - 1) changeSpeed(SPEEDS[idx + 1]); } break;
        case "<":
          e.preventDefault();
          { const idx = SPEEDS.indexOf(playbackRate);
          if (idx > 0) changeSpeed(SPEEDS[idx - 1]); } break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [togglePlay, seek, changeVolume, toggleFullscreen, toggleMute, toggleSubtitles, playbackRate, changeSpeed]);

  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      if (playing && mountedRef.current) setShowControls(false);
    }, 3000);
  }, [playing]);

  useEffect(() => {
    resetHideTimer();
    return () => { if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current); };
  }, [playing, resetHideTimer]);

  if (!src) {
    return (
      <div className="w-full aspect-video flex items-center justify-center bg-[#12121a] border border-[#2a2a3a]">
        <p className="text-[#8e8ea0] text-sm">No stream source available</p>
      </div>
    );
  }

  if (streamState === "error") {
    return (
      <div className="w-full aspect-video flex flex-col items-center justify-center bg-[#12121a] border border-[#2a2a3a] gap-3">
        <div className="w-12 h-12 rounded-full bg-[#f5c542]/10 flex items-center justify-center">
          <svg className="w-6 h-6 text-[#f5c542]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-[#f5c542] text-sm font-semibold">{errorMsg}</p>
        <button
          onClick={() => { setStreamState("loading"); setErrorMsg(""); window.location.reload(); }}
          className="px-4 py-2 text-sm bg-[#2a2a3a] text-white hover:bg-[#f5c542]/20 hover:text-[#f5c542] transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferProgress = duration > 0 ? (buffered / duration) * 100 : 0;
  const subtitleTracks = captions || [];

  return (
    <div
      ref={containerRef}
      className="relative w-full group/player bg-black"
      onMouseMove={resetHideTimer}
      onMouseLeave={() => { if (playing) setShowControls(false); }}
    >
      <style>{`
        video::cue {
          background: rgba(0, 0, 0, 0.75) !important;
          color: #fff !important;
          font-size: 1.1em !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          line-height: 1.4 !important;
          padding: 4px 8px !important;
          border-radius: 2px !important;
        }
      `}</style>

      <video
        ref={videoRef}
        className="w-full aspect-video object-contain bg-black"
        poster={poster}
        playsInline
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
      >
        {subtitleTracks.map((c) => (
          <track
            key={c.lang}
            src={c.url}
            kind="subtitles"
            srcLang={c.lang}
            label={c.label || c.lang}
            default={c.lang === "en"}
          />
        ))}
      </video>

      <PlayerTitle
        title={title}
        subtitle={subtitle}
        isPlaying={playing}
        isPaused={!playing && currentTime > 0}
        isBuffering={buffering}
        currentTime={currentTime}
      />

      {buffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-12 h-12 border-3 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {keyboardHint && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="px-4 py-2 bg-black/70 backdrop-blur-sm text-white text-sm font-medium rounded-lg border border-white/10 animate-fadeIn">
            {keyboardHint}
          </div>
        </div>
      )}

      <div
        className={`absolute bottom-0 left-0 right-0 z-20 transition-all duration-300 ${
          showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
        }`}
      >
        <div className="bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-16 pb-3 px-4">
          {/* Progress bar */}
          <div
            className="group/progress relative w-full h-1.5 bg-white/20 cursor-pointer mb-3 hover:h-2.5 transition-all"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              const video = videoRef.current;
              if (video && duration > 0) video.currentTime = pct * duration;
            }}
          >
            <div className="absolute left-0 top-0 h-full bg-white/30 rounded-full" style={{ width: `${bufferProgress}%` }} />
            <div className="absolute left-0 top-0 h-full bg-[#f5c542] rounded-full" style={{ width: `${progress}%` }}>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-[#f5c542] rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity shadow-lg" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button onClick={togglePlay} className="text-white hover:text-[#f5c542] transition-colors">
              {playing ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6zM14 4h4v16h-4z" /></svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              )}
            </button>

            {/* Skip back */}
            <button onClick={() => seek(-10)} className="text-white/70 hover:text-white transition-colors hidden sm:block">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
              </svg>
            </button>

            {/* Skip forward */}
            <button onClick={() => seek(10)} className="text-white/70 hover:text-white transition-colors hidden sm:block">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
              </svg>
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1 group/vol">
              <button onClick={toggleMute} className="text-white/70 hover:text-white transition-colors">
                {muted || volume === 0 ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                ) : volume < 0.5 ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  const video = videoRef.current;
                  if (video) { video.volume = v; video.muted = v === 0; }
                  setVolume(v);
                  setMuted(v === 0);
                }}
                className="w-0 group-hover/vol:w-20 transition-all duration-200 accent-[#f5c542] h-1 cursor-pointer"
              />
            </div>

            {/* Time */}
            <span className="text-white/80 text-xs font-mono">
              {formatTime(currentTime)} <span className="text-white/40">/</span> {formatTime(duration)}
            </span>

            <div className="flex-1" />

            {/* Subtitle button */}
            {subtitleTracks.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowSubtitleMenu(!showSubtitleMenu)}
                  className={`px-2 py-1 text-xs font-medium border transition-colors hidden sm:block ${
                    activeTrack
                      ? "border-[#f5c542] text-[#f5c542] bg-[#f5c542]/10"
                      : "border-white/20 text-white/60 hover:text-white"
                  }`}
                >
                  CC
                </button>
                {showSubtitleMenu && (
                  <div className="absolute bottom-full right-0 mb-2 bg-[#12121a] border border-[#2a2a3a] shadow-2xl min-w-[120px] py-1">
                    <button
                      onClick={() => selectTrack("")}
                      className={`block w-full text-left px-4 py-1.5 text-sm hover:bg-[#f5c542]/10 transition-colors ${!activeTrack ? "text-[#f5c542] font-semibold" : "text-white"}`}
                    >
                      Off
                    </button>
                    {subtitleTracks.map((c) => (
                      <button
                        key={c.lang}
                        onClick={() => selectTrack(c.lang)}
                        className={`block w-full text-left px-4 py-1.5 text-sm hover:bg-[#f5c542]/10 transition-colors ${activeTrack === c.lang ? "text-[#f5c542] font-semibold" : "text-white"}`}
                      >
                        {c.label || c.lang}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Speed */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="px-2 py-1 text-xs font-medium bg-black/60 backdrop-blur-sm text-white/80 hover:text-white border border-white/10 hover:border-[#f5c542]/50 transition-colors"
              >
                {playbackRate}x
              </button>
              {showSpeedMenu && (
                <div className="absolute bottom-full right-0 mb-2 bg-[#12121a] border border-[#2a2a3a] shadow-2xl min-w-[100px] py-1">
                  {SPEEDS.map((s) => (
                    <button
                      key={s}
                      onClick={() => changeSpeed(s)}
                      className={`block w-full text-left px-4 py-1.5 text-sm hover:bg-[#f5c542]/10 transition-colors ${s === playbackRate ? "text-[#f5c542] font-semibold" : "text-white"}`}
                    >
                      {s}x {s === 1 && <span className="text-[10px] text-[#8e8ea0]">Normal</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button onClick={toggleFullscreen} className="text-white/70 hover:text-white transition-colors">
              {isFullscreen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
