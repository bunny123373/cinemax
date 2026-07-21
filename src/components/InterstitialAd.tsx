"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";

const INTERSTITIAL_INTERVAL = 3;
const STORAGE_KEY = "interstitial_count";

export default function InterstitialAd() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    const count = parseInt(localStorage.getItem(STORAGE_KEY) || "0");
    const next = count + 1;
    localStorage.setItem(STORAGE_KEY, String(next));

    if (next % INTERSTITIAL_INTERVAL === 0 && next > 0) {
      setShow(true);
    }
  }, [pathname]);

  useEffect(() => {
    if (!show) return;
    setCanSkip(false);
    setCountdown(5);
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
    return () => clearInterval(timer);
  }, [show]);

  const close = useCallback(() => {
    setShow(false);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/90">
      <div className="relative w-full max-w-[600px] mx-4">
        <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl overflow-hidden">
          <div className="aspect-video bg-[#1a1a26] flex items-center justify-center relative">
            <div className="text-center p-8">
              <p className="text-xs text-[#8e8ea0] mb-2 uppercase tracking-wider">Advertisement</p>
              <div className="w-20 h-20 rounded-full bg-[#f5c542]/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-[#f5c542]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="3" width="20" height="14" rx="2"/><path d="m8 21 4-4 4 4"/><path d="M12 17V10"/>
                </svg>
              </div>
              <p className="text-sm text-[#8e8ea0]">Your ad space here</p>
              <p className="text-xs text-[#8e8ea0]/60 mt-1">Connect your ad network to display ads</p>
            </div>
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t border-[#2a2a3a]">
            <span className="text-xs text-[#8e8ea0]">
              {canSkip ? "You can skip now" : `Skip in ${countdown}s`}
            </span>
            <button
              onClick={close}
              disabled={!canSkip}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                canSkip
                  ? "bg-[#f5c542] text-[#0a0a0f] hover:bg-[#e0b530]"
                  : "bg-[#2a2a3a] text-[#8e8ea0] cursor-not-allowed"
              }`}
            >
              {canSkip ? "Skip Ad" : `${countdown}s`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
