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
  onProgress?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  onError?: () => void;
}

const LOADING_TIMEOUT = 15000;

function detectType(src: string): string {
  if (src.includes(".m3u8")) return "application/x-mpegurl";
  if (src.includes(".mpd")) return "application/dash+xml";
  if (src.includes(".mp4")) return "video/mp4";
  return "video/mp4";
}

export default function Player({ src, type, poster, autoPlay, onProgress, onEnded, onError }: PlayerProps) {
  const playerRef = useRef<MediaPlayerInstance>(null);
  const lastProgressRef = useRef(0);
  const mountedRef = useRef(true);
  const [streamState, setStreamState] = useState<"loading" | "playing" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    return () => { mountedRef.current = false; };
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
    provider.config = {
      enableWorker: false,
      backBufferLength: 90,
    };
  }, []);

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
    if (mediaError?.message) {
      msg = mediaError.message;
    }
    triggerError(msg);
  }, [triggerError]);

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

  if (!src) {
    return (
      <div className="w-full aspect-video flex items-center justify-center bg-[#12121a] border border-[#2a2a3a]">
        <p className="text-[#8e8ea0] text-sm">No stream source available</p>
      </div>
    );
  }

  if (streamState === "error") {
    return (
      <div className="w-full aspect-video flex flex-col items-center justify-center bg-[#12121a] border border-[#2a2a3a] gap-2">
        <p className="text-[#f5c542] text-sm font-semibold">{errorMsg}</p>
        <button
          onClick={() => { setStreamState("loading"); setErrorMsg(""); }}
          className="text-xs text-[#8e8ea0] hover:text-white transition-colors underline"
        >
          Retry
        </button>
      </div>
    );
  }

  const detected = type === "hls" ? "application/x-mpegurl"
    : type === "dash" ? "application/dash+xml"
    : type === "mp4" ? "video/mp4"
    : detectType(src);
  const mimeType = detected as "application/x-mpegurl" | "application/dash+xml" | "video/mp4";

  return (
    <MediaPlayer
      ref={playerRef}
      src={[{ src, type: mimeType }]}
      poster={poster}
      autoPlay={autoPlay}
      playsInline
      volume={0.5}
      crossOrigin="anonymous"
      aspectRatio="16/9"
      onProviderChange={onProviderChange}
      onTimeUpdate={onTimeUpdate}
      onEnded={onEndedCallback}
      onError={onErrorCallback}
    >
      <MediaProvider />
      <DefaultVideoLayout icons={defaultLayoutIcons} />
    </MediaPlayer>
  );
}
