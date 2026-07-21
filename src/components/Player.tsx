"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import Hls from "hls.js";
import { MediaPlayer, MediaProvider, isHLSProvider, type MediaPlayerInstance, type MediaProviderAdapter } from "@vidstack/react";
import { DefaultVideoLayout, defaultLayoutIcons } from "@vidstack/react/player/layouts/default";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

interface PlayerProps {
  src: string;
  type?: "hls" | "dash" | "mp4" | "auto";
  poster?: string;
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

const LOADING_TIMEOUT = 20000;

function detectType(src: string): string {
  if (src.includes(".m3u8")) return "application/x-mpegurl";
  if (src.includes(".mpd")) return "application/dash+xml";
  if (src.includes(".mp4")) return "video/mp4";
  return "video/mp4";
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function Player({ src, type, poster, autoPlay, startTime, captions, dubOptions, selectedDub, onDubChange, headers, onProgress, onEnded, onError }: PlayerProps) {
  const playerRef = useRef<MediaPlayerInstance>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastProgressRef = useRef(0);
  const mountedRef = useRef(true);
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);
  const [streamState, setStreamState] = useState<"loading" | "playing" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [isBuffering, setIsBuffering] = useState(false);
  const [showKeyboardHint, setShowKeyboardHint] = useState<string | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!startTime || !playerRef.current) return;
    const player = playerRef.current;
    const handler = () => {
      if (player && startTime > 0) {
        player.currentTime = startTime;
      }
    };
    player.addEventListener("can-play", handler, { once: true });
    return () => player.removeEventListener("can-play", handler);
  }, [startTime, src]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const onWaiting = () => setIsBuffering(true);
    const onPlay = () => setIsBuffering(false);
    player.addEventListener("waiting", onWaiting);
    player.addEventListener("play", onPlay);
    return () => {
      player.removeEventListener("waiting", onWaiting);
      player.removeEventListener("play", onPlay);
    };
  });

  const flashHint = useCallback((text: string) => {
    setShowKeyboardHint(text);
    setTimeout(() => setShowKeyboardHint(null), 800);
  }, []);

  const triggerError = useCallback((msg?: string) => {
    if (!mountedRef.current) return;
    setStreamState("error");
    setErrorMsg(msg || "Stream unavailable");
    if (onError) onError();
  }, [onError]);

  const onProviderChange = useCallback((provider: MediaProviderAdapter | null) => {
    if (!provider || !isHLSProvider(provider)) return;
    provider.library = Hls;
    const config: any = {
      enableWorker: false,
      backBufferLength: 90,
      maxBufferLength: 30,
      maxMaxBufferLength: 60,
    };
    if (headers && Object.keys(headers).length > 0) {
      config.xhrSetup = (xhr: XMLHttpRequest) => {
        Object.entries(headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });
      };
    }
    provider.config = config;
  }, [headers]);

  const onTimeUpdate = useCallback(({ currentTime }: { currentTime: number }) => {
    const player = playerRef.current;
    if (!player) return;
    setStreamState("playing");
    const now = Date.now();
    if (now - lastProgressRef.current < 5000) return;
    lastProgressRef.current = now;
    const duration = player.duration;
    if (duration > 0 && currentTime > 0 && onProgress) {
      onProgress(currentTime, duration);
    }
  }, [onProgress]);

  const onEndedCallback = useCallback(() => {
    if (onEnded) onEnded();
  }, [onEnded]);

  const onErrorCallback = useCallback((event: any) => {
    const detail = event?.detail;
    const mediaError = detail?.error || detail;
    let msg = "Stream unavailable";
    if (mediaError?.message) msg = mediaError.message;
    triggerError(msg);
  }, [triggerError]);

  const changeSpeed = useCallback((rate: number) => {
    const player = playerRef.current;
    if (!player) return;
    player.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
    flashHint(`${rate}x`);
  }, [flashHint]);

  useEffect(() => {
    if (!src || streamState === "error") return;
    setStreamState("loading");
    const timer = setTimeout(() => {
      const player = playerRef.current;
      if (!player) return;
      const currentTime = player.currentTime;
      const duration = player.duration;
      if ((currentTime === 0 || duration === 0) && streamState !== "playing") {
        triggerError("Stream timed out");
      }
    }, LOADING_TIMEOUT);
    return () => clearTimeout(timer);
  }, [src, triggerError, streamState]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const seek = (seconds: number) => {
      const player = playerRef.current;
      if (!player) return;
      const newTime = Math.max(0, Math.min(player.duration, player.currentTime + seconds));
      player.currentTime = newTime;
      flashHint(`${seconds > 0 ? "+" : ""}${seconds}s`);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const player = playerRef.current;
      if (!player) return;

      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          if ((player as any).playing) {
            player.pause();
            flashHint("⏸ Pause");
          } else {
            player.play();
            flashHint("▶ Play");
          }
          break;
        case "ArrowLeft":
          e.preventDefault();
          seek(-10);
          break;
        case "ArrowRight":
          e.preventDefault();
          seek(10);
          break;
        case "ArrowUp":
          e.preventDefault();
          player.volume = Math.min(1, player.volume + 0.1);
          flashHint(`🔊 ${Math.round(player.volume * 100)}%`);
          break;
        case "ArrowDown":
          e.preventDefault();
          player.volume = Math.max(0, player.volume - 0.1);
          flashHint(`🔊 ${Math.round(player.volume * 100)}%`);
          break;
        case "f":
        case "F":
          e.preventDefault();
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            container.requestFullscreen();
          }
          break;
        case "m":
        case "M":
          e.preventDefault();
          player.muted = !player.muted;
          flashHint(player.muted ? "🔇 Muted" : "🔊 Unmuted");
          break;
        case "c":
        case "C": {
          e.preventDefault();
          const tracks = Array.from(player.textTracks);
          const activeTrack = tracks.find((t: any) => t.mode === "showing");
          if (activeTrack) {
            activeTrack.mode = "hidden";
            flashHint("Subtitles Off");
          } else if (tracks.length > 0) {
            const firstTrack = tracks[0];
            if (firstTrack) firstTrack.mode = "showing";
            flashHint("Subtitles On");
          }
          break;
        }
        case "j":
        case "J":
          e.preventDefault();
          seek(-10);
          break;
        case "l":
        case "L":
          e.preventDefault();
          seek(10);
          break;
        case ">":
          e.preventDefault();
          const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
          const curIdx = speeds.indexOf(playbackRate);
          if (curIdx < speeds.length - 1) changeSpeed(speeds[curIdx + 1]);
          break;
        case "<":
          e.preventDefault();
          const speedsReverse = [0.5, 0.75, 1, 1.25, 1.5, 2];
          const curIdxR = speedsReverse.indexOf(playbackRate);
          if (curIdxR > 0) changeSpeed(speedsReverse[curIdxR - 1]);
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [flashHint, playbackRate, changeSpeed]);

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
        <div className="flex gap-3">
          <button
            onClick={() => { setStreamState("loading"); setErrorMsg(""); }}
            className="px-4 py-2 text-sm bg-[#2a2a3a] text-white hover:bg-[#f5c542]/20 hover:text-[#f5c542] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const detected = type === "hls" ? "application/x-mpegurl"
    : type === "dash" ? "application/dash+xml"
    : type === "mp4" ? "video/mp4"
    : detectType(src);
  const mimeType = detected as "application/x-mpegurl" | "application/dash+xml" | "video/mp4";

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <div ref={containerRef} className="relative w-full group/player">
      <style>{`
        .vds-video-layout [data-tip]::after { font-size: 12px !important; }
        video::cue {
          background: rgba(0, 0, 0, 0.75) !important;
          color: #fff !important;
          font-size: 1.1em !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          line-height: 1.4 !important;
          padding: 4px 8px !important;
          border-radius: 2px !important;
        }
        video::cue(:lang(en)) { border-bottom: 2px solid #f5c542 !important; }
      `}</style>

      <MediaPlayer
        ref={playerRef}
        src={[{ src, type: mimeType }]}
        poster={poster}
        autoPlay={autoPlay}
        playsInline
        viewType="video"
        volume={0.5}
        crossOrigin="anonymous"
        aspectRatio="16/9"
        onProviderChange={onProviderChange}
        onTimeUpdate={onTimeUpdate}
        onEnded={onEndedCallback}
        onError={onErrorCallback}
      >
        <MediaProvider />
        {captions?.map((c) => (
          <track
            key={c.lang}
            src={c.url}
            kind="subtitles"
            srcLang={c.lang}
            label={c.label || c.lang}
            default={c.lang === "en"}
          />
        ))}
        <DefaultVideoLayout icons={defaultLayoutIcons} />
      </MediaPlayer>

      {isBuffering && streamState === "playing" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-10 h-10 rounded-full border-2 border-[#f5c542] border-t-transparent animate-spin" />
        </div>
      )}

      {showKeyboardHint && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="px-4 py-2 bg-black/70 backdrop-blur-sm text-white text-sm font-medium rounded-lg border border-white/10 animate-fadeIn">
            {showKeyboardHint}
          </div>
        </div>
      )}

      <div className="absolute bottom-14 right-4 z-20 hidden group-hover/player:flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
            className="px-2.5 py-1 text-xs font-medium bg-black/60 backdrop-blur-sm text-white/80 hover:text-white border border-white/10 hover:border-[#f5c542]/50 transition-colors"
          >
            {playbackRate}x
          </button>
          {showSpeedMenu && (
            <div className="absolute bottom-full right-0 mb-2 bg-[#12121a] border border-[#2a2a3a] shadow-2xl min-w-[100px] py-1">
              {speeds.map((s) => (
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
      </div>
    </div>
  );
}
