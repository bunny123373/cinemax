"use client";

import { useEffect, useState, useCallback, useRef } from "react";

const AD_SCRIPT = "https://pl30358094.effectivecpmnetwork.com/5b32e232715e9ba2b90136af474ea24d/invoke.js";
const AD_CONTAINER_ID = "container-5b32e232715e9ba2b90136af474ea24d";

interface PreRollAdProps {
  onComplete: () => void;
  duration?: number;
}

export default function PreRollAd({ onComplete, duration = 8 }: PreRollAdProps) {
  const [countdown, setCountdown] = useState(duration);
  const [canSkip, setCanSkip] = useState(false);
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCanSkip(false);
    setCountdown(duration);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanSkip(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    if (adRef.current && !document.getElementById(AD_CONTAINER_ID)) {
      const script = document.createElement("script");
      script.src = AD_SCRIPT;
      script.async = false;
      (script as any).data_cfasync = "false";
      adRef.current.appendChild(script);
    }

    return () => clearInterval(timer);
  }, [duration]);

  const skip = useCallback(() => {
    onComplete();
  }, [onComplete]);

  return (
    <div className="w-full aspect-video bg-[#0a0a0f] relative flex items-center justify-center overflow-hidden">
      <div ref={adRef} className="absolute inset-0 flex items-center justify-center" />

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#2a2a3a] z-10">
        <div
          className="h-full bg-[#f5c542] transition-all duration-1000"
          style={{ width: `${((duration - countdown) / duration) * 100}%` }}
        />
      </div>

      <div className="absolute top-3 right-3 z-10">
        {canSkip ? (
          <button
            onClick={skip}
            className="px-4 py-2 text-sm font-medium bg-[#f5c542] text-[#0a0a0f] rounded-lg hover:bg-[#e0b530] transition-colors"
          >
            Skip Ad
          </button>
        ) : (
          <span className="px-3 py-1.5 text-xs font-medium bg-black/60 text-white/80 rounded-lg border border-white/10">
            Skip in {countdown}s
          </span>
        )}
      </div>

      <div className="absolute top-3 left-3 z-10">
        <span className="px-2 py-1 text-[10px] font-medium bg-black/60 text-[#8e8ea0] rounded border border-white/10">
          AD
        </span>
      </div>
    </div>
  );
}
