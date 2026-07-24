"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { ThumbnailImageInit } from "@vidstack/react";

interface ThumbnailOptions {
  interval?: number;
  spriteWidth?: number;
  spriteHeight?: number;
  cols?: number;
  rows?: number;
  maxThumbnails?: number;
}

interface ThumbnailResult {
  thumbnails: ThumbnailImageInit[];
  loading: boolean;
  error: string | null;
  progress: number;
}

function formatVttTimestamp(timeInSeconds: number): string {
  const h = Math.floor(timeInSeconds / 3600);
  const m = Math.floor((timeInSeconds % 3600) / 60);
  const s = Math.floor(timeInSeconds % 60);
  const ms = Math.floor((timeInSeconds % 1) * 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(ms).padStart(3, "0")}`;
}

function generateVttBlob(thumbnails: ThumbnailImageInit[], frameDuration: number): string {
  const lines = ["WEBVTT"];

  for (const thumb of thumbnails) {
    const startTime = thumb.startTime;
    const endTime = startTime + frameDuration;
    const coords = thumb.coords;
    const xywh = coords ? `#xywh=${coords.x},${coords.y},${thumb.width || 0},${thumb.height || 0}` : "";

    lines.push("");
    lines.push(`${formatVttTimestamp(startTime)} --> ${formatVttTimestamp(endTime)}`);
    lines.push(`${thumb.url}${xywh}`);
  }

  return lines.join("\n");
}

export function useDynamicThumbnails(
  videoSrc: string | undefined,
  duration: number,
  options: ThumbnailOptions = {}
): ThumbnailResult {
  const {
    interval = 5,
    spriteWidth = 160,
    spriteHeight = 90,
    cols = 10,
    rows = 10,
    maxThumbnails = 200,
  } = options;

  const [result, setResult] = useState<ThumbnailResult>({
    thumbnails: [],
    loading: false,
    error: null,
    progress: 0,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const generateThumbnails = useCallback(async () => {
    if (!videoSrc || duration <= 0) {
      setResult({ thumbnails: [], loading: false, error: null, progress: 0 });
      return;
    }

    setResult((prev) => ({ ...prev, loading: true, error: null, progress: 0 }));

    try {
      const video = document.createElement("video");
      video.crossOrigin = "anonymous";
      video.preload = "auto";
      video.muted = true;
      video.playsInline = true;

      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error("Failed to load video for thumbnails"));
        video.src = videoSrc;
      });

      const totalFrames = Math.min(
        Math.ceil(duration / interval),
        maxThumbnails
      );
      const framesPerPage = cols * rows;
      const totalPages = Math.ceil(totalFrames / framesPerPage);

      const spriteSheetWidth = cols * spriteWidth;
      const spriteSheetHeight = rows * spriteHeight;

      const thumbnails: ThumbnailImageInit[] = [];

      for (let page = 0; page < totalPages; page++) {
        const canvas = document.createElement("canvas");
        canvas.width = spriteSheetWidth;
        canvas.height = spriteSheetHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;

        const framesOnPage = Math.min(
          framesPerPage,
          totalFrames - page * framesPerPage
        );

        for (let frame = 0; frame < framesOnPage; frame++) {
          const frameIndex = page * framesPerPage + frame;
          const time = frameIndex * interval;

          if (time > duration) break;

          try {
            await new Promise<void>((resolve, reject) => {
              video.onseeked = () => resolve();
              video.onerror = () => reject(new Error("Seek failed"));
              video.currentTime = time;
            });

            ctx.drawImage(
              video,
              0, 0, video.videoWidth, video.videoHeight,
              (frame % cols) * spriteWidth,
              Math.floor(frame / cols) * spriteHeight,
              spriteWidth,
              spriteHeight
            );

            const col = frame % cols;
            const row = Math.floor(frame / cols);

            thumbnails.push({
              url: canvas.toDataURL("image/jpeg", 0.5),
              startTime: time,
              width: spriteWidth,
              height: spriteHeight,
              coords: {
                x: col * spriteWidth,
                y: row * spriteHeight,
              },
            });

            setResult((prev) => ({
              ...prev,
              progress: Math.round((frameIndex / totalFrames) * 100),
            }));
          } catch (err) {
            continue;
          }
        }

        if (page < totalPages - 1) {
          const dataUrl = canvas.toDataURL("image/jpeg", 0.5);
          for (let frame = 0; frame < framesOnPage; frame++) {
            const frameIndex = page * framesPerPage + frame;
            const col = frame % cols;
            const row = Math.floor(frame / cols);
            const idx = thumbnails.length - framesOnPage + frame;
            if (idx >= 0 && idx < thumbnails.length) {
              thumbnails[idx].url = dataUrl;
            }
          }
        }
      }

      video.src = "";

      setResult({
        thumbnails,
        loading: false,
        error: null,
        progress: 100,
      });
    } catch (err) {
      setResult({
        thumbnails: [],
        loading: false,
        error: err instanceof Error ? err.message : "Failed to generate thumbnails",
        progress: 0,
      });
    }
  }, [videoSrc, duration, interval, spriteWidth, spriteHeight, cols, rows, maxThumbnails]);

  useEffect(() => {
    if (videoSrc && duration > 0) {
      generateThumbnails();
    }
  }, [videoSrc, duration, generateThumbnails]);

  return result;
}

export function generateThumbnailVtt(
  thumbnails: ThumbnailImageInit[],
  frameDuration: number
): string {
  return generateVttBlob(thumbnails, frameDuration);
}

export function useThumbnailVtt(
  videoSrc: string | undefined,
  duration: number,
  interval?: number
): { vttUrl: string | null; loading: boolean } {
  const { thumbnails, loading } = useDynamicThumbnails(videoSrc, duration, { interval });
  const [vttUrl, setVttUrl] = useState<string | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (thumbnails.length > 0 && duration > 0) {
      const frameDuration = duration / Math.ceil(duration / (interval || 5));
      const vttContent = generateVttBlob(thumbnails, frameDuration);
      const blob = new Blob([vttContent], { type: "text/vtt" });

      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }

      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;
      setVttUrl(url);
    }

    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, [thumbnails, duration, interval]);

  return { vttUrl, loading };
}
