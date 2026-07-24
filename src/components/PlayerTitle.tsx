"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface PlayerTitleProps {
  title?: string;
  subtitle?: string;
  isPlaying?: boolean;
  isPaused?: boolean;
  isBuffering?: boolean;
  currentTime?: number;
  showOnHover?: boolean;
  showOnPause?: boolean;
  showOnIdle?: boolean;
  idleTimeout?: number;
  className?: string;
}

export default function PlayerTitle({
  title = "",
  subtitle = "",
  isPlaying = false,
  isPaused = false,
  isBuffering = false,
  currentTime = 0,
  showOnHover = true,
  showOnPause = true,
  showOnIdle = true,
  idleTimeout = 3000,
  className = "",
}: PlayerTitleProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const shouldShow = useCallback(() => {
    if (showOnHover && isHovered) return true;
    if (showOnPause && isPaused) return true;
    if (isBuffering) return true;
    if (isExpanded) return true;
    return false;
  }, [showOnHover, isHovered, showOnPause, isPaused, isBuffering, isExpanded]);

  useEffect(() => {
    if (showOnIdle && !isPlaying && !isPaused) {
      setIsVisible(true);
      return;
    }

    if (shouldShow()) {
      setIsVisible(true);
      resetIdleTimer();
    } else if (isPlaying && !isHovered) {
      startIdleTimer();
    }

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [isPlaying, isPaused, isHovered, isBuffering, shouldShow, showOnIdle]);

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (isPlaying && !isHovered) {
      idleTimerRef.current = setTimeout(() => {
        if (!isPaused && !isBuffering) {
          setIsVisible(false);
        }
      }, idleTimeout);
    }
  }, [isPlaying, isHovered, isPaused, isBuffering, idleTimeout]);

  const startIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      if (!isPaused && !isBuffering && !isHovered) {
        setIsVisible(false);
      }
    }, idleTimeout);
  }, [isPaused, isBuffering, isHovered, idleTimeout]);

  useEffect(() => {
    if (isPlaying && !isHovered) {
      startIdleTimer();
    }
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [isPlaying, isHovered, startIdleTimer]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    setIsVisible(true);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    if (isPlaying && !isPaused) {
      startIdleTimer();
    }
  }, [isPlaying, isPaused, startIdleTimer]);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  if (!title && !subtitle) return null;

  return (
    <div
      ref={containerRef}
      className={`absolute top-0 left-0 right-0 z-30 pointer-events-auto ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={`transition-all duration-300 ease-out ${
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <div
          className={`relative overflow-hidden transition-all duration-500 ease-out ${
            isExpanded
              ? "bg-gradient-to-b from-black/90 via-black/70 to-transparent pb-6 pt-4 px-4"
              : "bg-gradient-to-b from-black/80 via-black/50 to-transparent pt-3 pb-8 px-4"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {title && (
                <h3
                  className={`font-semibold text-white leading-tight transition-all duration-300 ${
                    isExpanded
                      ? "text-lg md:text-xl mb-2"
                      : "text-sm md:text-base mb-1 line-clamp-1"
                  }`}
                  style={{
                    textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                  }}
                >
                  {title}
                </h3>
              )}

              {subtitle && (
                <p
                  className={`text-white/70 transition-all duration-300 ${
                    isExpanded
                      ? "text-sm md:text-base line-clamp-3"
                      : "text-xs md:text-sm line-clamp-1"
                  }`}
                  style={{
                    textShadow: "0 1px 4px rgba(0,0,0,0.4)",
                  }}
                >
                  {subtitle}
                </p>
              )}
            </div>

            {title && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded();
                }}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white/70 hover:text-white transition-all duration-200"
                aria-label={isExpanded ? "Collapse title" : "Expand title"}
              >
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            )}
          </div>

          {isExpanded && subtitle && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="flex items-center gap-2 text-xs text-white/50">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#f5c542]" />
                <span>Now Playing</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
