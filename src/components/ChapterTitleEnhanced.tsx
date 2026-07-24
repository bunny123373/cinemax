"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { MediaPlayerInstance } from "@vidstack/react";

interface Chapter {
  startTime: number;
  endTime: number;
  title: string;
}

interface ChapterTitleEnhancedProps {
  isPlaying?: boolean;
  currentTime?: number;
  duration?: number;
  playerRef?: React.RefObject<MediaPlayerInstance | null>;
  showNavigation?: boolean;
  showProgress?: boolean;
  showChapterNumber?: boolean;
  className?: string;
}

export default function ChapterTitleEnhanced({
  isPlaying = false,
  currentTime = 0,
  duration = 0,
  playerRef,
  showNavigation = true,
  showProgress = true,
  showChapterNumber = true,
  className = "",
}: ChapterTitleEnhancedProps) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeChapterIndex, setActiveChapterIndex] = useState(-1);
  const [chapterProgress, setChapterProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

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
      } catch {
        // chapters not available
      }
    };

    extractChapters();
    player.addEventListener("loaded-metadata", extractChapters, { once: true });
    return () => player.removeEventListener("loaded-metadata", extractChapters);
  }, [playerRef]);

  useEffect(() => {
    if (!chapters || chapters.length === 0) {
      setActiveChapterIndex(-1);
      return;
    }

    const idx = chapters.findIndex(
      (ch) => currentTime >= ch.startTime && currentTime < ch.endTime
    );
    setActiveChapterIndex(idx);
  }, [chapters, currentTime]);

  useEffect(() => {
    if (activeChapterIndex < 0 || !chapters || activeChapterIndex >= chapters.length) {
      setChapterProgress(0);
      return;
    }

    const chapter = chapters[activeChapterIndex];
    const chapterDuration = chapter.endTime - chapter.startTime;
    if (chapterDuration <= 0) {
      setChapterProgress(0);
      return;
    }

    const elapsed = currentTime - chapter.startTime;
    setChapterProgress(Math.min(100, Math.max(0, (elapsed / chapterDuration) * 100)));
  }, [activeChapterIndex, chapters, currentTime]);

  useEffect(() => {
    if (activeChapterIndex >= 0 && chapters && chapters.length > 0) {
      setIsVisible(true);
      if (isPlaying) {
        resetHideTimer();
      }
    } else {
      setIsVisible(false);
    }
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [activeChapterIndex, chapters, isPlaying]);

  const resetHideTimer = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (isPlaying && !isExpanded) {
        setIsVisible(false);
      }
    }, 4000);
  }, [isPlaying, isExpanded]);

  const handleMouseEnter = useCallback(() => {
    setIsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (isPlaying && !isExpanded) {
      resetHideTimer();
    }
  }, [isPlaying, isExpanded, resetHideTimer]);

  const goToChapter = useCallback(
    (direction: "prev" | "next") => {
      if (!chapters || activeChapterIndex < 0) return;
      const player = playerRef?.current;
      if (!player) return;

      const targetIndex =
        direction === "prev"
          ? Math.max(0, activeChapterIndex - 1)
          : Math.min(chapters.length - 1, activeChapterIndex + 1);

      const targetChapter = chapters[targetIndex];
      if (targetChapter) {
        (player as any).currentTime = targetChapter.startTime;
        if (isPlaying) {
          resetHideTimer();
        }
      }
    },
    [chapters, activeChapterIndex, isPlaying, resetHideTimer, playerRef]
  );

  if (!chapters || chapters.length === 0 || activeChapterIndex < 0) {
    return null;
  }

  const currentChapter = chapters[activeChapterIndex];
  const hasPrev = activeChapterIndex > 0;
  const hasNext = activeChapterIndex < chapters.length - 1;

  return (
    <div
      className={`absolute bottom-16 left-4 z-30 pointer-events-auto max-w-[400px] ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={`transition-all duration-300 ease-out ${
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2 pointer-events-none"
        }`}
      >
        <div
          className={`relative overflow-hidden transition-all duration-400 ease-out ${
            isExpanded
              ? "bg-black/85 backdrop-blur-md rounded-lg p-4"
              : "bg-black/70 backdrop-blur-sm rounded-md px-3 py-2"
          }`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            {showChapterNumber && (
              <span className="flex-shrink-0 text-[10px] font-bold text-[#f5c542] bg-[#f5c542]/15 px-1.5 py-0.5 rounded">
                {activeChapterIndex + 1}/{chapters.length}
              </span>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-white text-sm font-medium truncate">
                  {currentChapter?.title || `Chapter ${activeChapterIndex + 1}`}
                </span>
              </div>

              {isExpanded && (
                <div className="mt-2 space-y-2">
                  {currentChapter && (
                    <div className="flex items-center justify-between text-[11px] text-white/50">
                      <span>
                        {formatTime(currentChapter.startTime)}
                      </span>
                      <span>
                        {formatTime(currentChapter.endTime)}
                      </span>
                    </div>
                  )}

                  {showProgress && (
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#f5c542] rounded-full transition-all duration-300"
                        style={{ width: `${chapterProgress}%` }}
                      />
                    </div>
                  )}

                  {showNavigation && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          goToChapter("prev");
                        }}
                        disabled={!hasPrev}
                        className={`flex items-center gap-1 px-2 py-1 text-[11px] rounded transition-colors ${
                          hasPrev
                            ? "text-white/80 hover:text-white hover:bg-white/10"
                            : "text-white/20 cursor-not-allowed"
                        }`}
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        Prev
                      </button>

                      <div className="flex-1" />

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          goToChapter("next");
                        }}
                        disabled={!hasNext}
                        className={`flex items-center gap-1 px-2 py-1 text-[11px] rounded transition-colors ${
                          hasNext
                            ? "text-white/80 hover:text-white hover:bg-white/10"
                            : "text-white/20 cursor-not-allowed"
                        }`}
                      >
                        Next
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <svg
              className={`w-3.5 h-3.5 text-white/40 transition-transform duration-200 flex-shrink-0 ${
                isExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}
