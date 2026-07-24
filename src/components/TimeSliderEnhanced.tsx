"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import type { MediaPlayerInstance } from "@vidstack/react";

interface Chapter {
  startTime: number;
  endTime: number;
  title: string;
}

interface TimeSliderEnhancedProps {
  currentTime?: number;
  duration?: number;
  buffered?: number;
  playerRef?: React.RefObject<MediaPlayerInstance | null>;
  showPreview?: boolean;
  showChapters?: boolean;
  className?: string;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function TimeSliderEnhanced({
  currentTime = 0,
  duration = 0,
  buffered = 0,
  playerRef,
  showPreview = true,
  showChapters = true,
  className = "",
}: TimeSliderEnhancedProps) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isPointing, setIsPointing] = useState(false);
  const [hoverX, setHoverX] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const player = playerRef?.current;
    if (!player) return;
    const extractChapters = () => {
      try {
        const textTracks = (player as any).textTracks;
        if (!textTracks) return;
        const track = Array.from(textTracks as any[]).find(
          (t: any) => t.kind === "chapters" || (t as any).cueType === "chapters"
        );
        if (!track) return;
        const cues = track.cues || [];
        const result: Chapter[] = Array.from(cues as any[]).map((cue: any) => ({
          startTime: cue.startTime,
          endTime: cue.endTime,
          title: cue.text || "",
        }));
        if (result.length > 0) setChapters(result);
      } catch {}
    };
    extractChapters();
    player.addEventListener("loaded-metadata", extractChapters, { once: true });
    return () => player.removeEventListener("loaded-metadata", extractChapters);
  }, [playerRef]);

  const hasChapters = showChapters && chapters.length > 0;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferPercent = duration > 0 ? (buffered / duration) * 100 : 0;

  const seekToPosition = useCallback((clientX: number) => {
    const track = trackRef.current;
    const player = playerRef?.current;
    if (!track || !player || duration <= 0) return;
    const rect = track.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    player.currentTime = ratio * duration;
  }, [playerRef, duration]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    seekToPosition(e.clientX);
  }, [seekToPosition]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    setHoverX(((e.clientX - rect.left) / rect.width) * 100);
    if (isDragging) seekToPosition(e.clientX);
  }, [isDragging, seekToPosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseEnter = useCallback(() => setIsPointing(true), []);
  const handleMouseLeave = useCallback(() => {
    setIsPointing(false);
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => seekToPosition(e.clientX);
    const onUp = () => setIsDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDragging, seekToPosition]);

  const hoverTime = duration > 0 ? (hoverX / 100) * duration : 0;

  return (
    <div className={`relative ${className}`}>
      <div
        ref={trackRef}
        className="time-slider-enhanced group/slider"
        data-pointing={isPointing || undefined}
        data-dragging={isDragging || undefined}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {hasChapters ? (
          <div className="time-chapters">
            {chapters.map((ch, i) => {
              const chStart = duration > 0 ? (ch.startTime / duration) * 100 : 0;
              const chEnd = duration > 0 ? (ch.endTime / duration) * 100 : 0;
              const width = chEnd - chStart;
              const isActive = currentTime >= ch.startTime && currentTime < ch.endTime;
              const filled = isActive
                ? Math.max(0, Math.min(100, ((currentTime - ch.startTime) / (ch.endTime - ch.startTime)) * 100))
                : currentTime >= ch.endTime ? 100 : 0;
              return (
                <div
                  key={ch.startTime}
                  className="time-chapter"
                  style={{ flex: `0 0 ${width}%` }}
                >
                  <div className="time-track">
                    <div className="time-track-fill" style={{ width: `${filled}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="time-track">
            <div className="time-track-buffer" style={{ width: `${bufferPercent}%` }} />
            <div className="time-track-fill" style={{ width: `${progress}%` }} />
          </div>
        )}

        <div className="time-thumb" style={{ left: `${progress}%` }} />
      </div>

      {hasChapters && (
        <div className="time-chapter-markers">
          {chapters.map((ch, i) => {
            if (i === 0) return null;
            const pct = duration > 0 ? (ch.startTime / duration) * 100 : 0;
            return (
              <div
                key={ch.startTime}
                className="time-chapter-marker"
                style={{ left: `${pct}%` }}
              />
            );
          })}
        </div>
      )}

      {showPreview && (isPointing || isDragging) && (
        <div
          className="time-preview"
          style={{ left: `${hoverX}%` }}
        >
          {hasChapters && (
            <span className="time-preview-chapter">
              {chapters.find((ch) => hoverTime >= ch.startTime && hoverTime < ch.endTime)?.title || ""}
            </span>
          )}
          <span className="time-preview-value">{formatTime(hoverTime)}</span>
        </div>
      )}

      <style>{`
        .time-slider-enhanced {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
          height: 20px;
          cursor: pointer;
          touch-action: none;
          user-select: none;
        }

        .time-slider-enhanced[data-pointing],
        .time-slider-enhanced[data-dragging] {
          height: 24px;
        }

        .time-track {
          position: relative;
          width: 100%;
          height: 4px;
          border-radius: 2px;
          background: rgba(255, 255, 255, 0.15);
          overflow: visible;
          transition: height 0.15s ease;
        }

        .time-slider-enhanced[data-pointing] .time-track,
        .time-slider-enhanced[data-dragging] .time-track {
          height: 6px;
        }

        .time-track-fill {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background: linear-gradient(90deg, #f5c542 0%, #e8b730 100%);
          border-radius: 2px;
          transition: width 0.1s linear;
        }

        .time-slider-enhanced[data-dragging] .time-track-fill {
          background: linear-gradient(90deg, #ffd666 0%, #f5c542 100%);
        }

        .time-track-buffer {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background: rgba(255, 255, 255, 0.25);
          border-radius: 2px;
        }

        .time-thumb {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%) scale(0);
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #f5c542;
          box-shadow: 0 0 6px rgba(0, 0, 0, 0.4), 0 0 12px rgba(245, 197, 66, 0.3);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          z-index: 2;
        }

        .time-slider-enhanced[data-pointing] .time-thumb,
        .time-slider-enhanced[data-dragging] .time-thumb {
          transform: translate(-50%, -50%) scale(1);
        }

        .time-slider-enhanced[data-dragging] .time-thumb {
          box-shadow: 0 0 8px rgba(0, 0, 0, 0.5), 0 0 20px rgba(245, 197, 66, 0.5);
          width: 16px;
          height: 16px;
        }

        .time-chapters {
          display: flex;
          width: 100%;
          height: 100%;
          position: relative;
        }

        .time-chapter {
          position: relative;
          height: 100%;
        }

        .time-chapter-marker {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 3px;
          height: 10px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 1px;
          z-index: 1;
          pointer-events: none;
          transition: height 0.15s ease, background 0.15s ease;
        }

        .time-slider-enhanced[data-pointing] .time-chapter-marker,
        .time-slider-enhanced[data-dragging] .time-chapter-marker {
          height: 14px;
          background: rgba(255, 255, 255, 0.5);
        }

        .time-chapter-markers {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 1;
        }

        .time-preview {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          position: absolute;
          bottom: 100%;
          transform: translateX(-50%);
          padding: 6px 10px;
          background: rgba(18, 18, 26, 0.95);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          pointer-events: none;
          margin-bottom: 8px;
          white-space: nowrap;
          z-index: 10;
        }

        .time-preview::after {
          content: "";
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 5px solid transparent;
          border-top-color: rgba(18, 18, 26, 0.95);
        }

        .time-preview-chapter {
          font-size: 11px;
          font-weight: 600;
          color: #f5c542;
          max-width: 180px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .time-preview-value {
          font-size: 12px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.9);
          font-variant-numeric: tabular-nums;
        }
      `}</style>
    </div>
  );
}
