"use client";

import { useEffect, useState, useCallback } from "react";

const SMART_LINK_URL = "https://omg10.com/4/10635439";
const TELEGRAM_URL = "https://t.me/MultiMirror";
const STORAGE_KEY = "exit_popup_shown";
const COOLDOWN = 86400000;

export default function ExitIntentPopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const lastShown = parseInt(localStorage.getItem(STORAGE_KEY) || "0");
    if (Date.now() - lastShown < COOLDOWN) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !e.relatedTarget) {
        setShow(true);
        localStorage.setItem(STORAGE_KEY, String(Date.now()));
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, []);

  const close = useCallback(() => setShow(false), []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[290] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={close}>
      <div
        className="bg-[#18181f] border border-[#2a2a3a] shadow-2xl w-full max-w-[420px] mx-4 rounded-2xl overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <p className="text-xs text-[#8e8ea0] uppercase tracking-wider mb-2">Before You Go</p>
          <h2 className="text-xl font-bold text-white mb-2">Stay Protected Online</h2>
          <p className="text-sm text-[#8e8ea0] mb-5">
            Browse privately and access content from anywhere. Special offer just for you.
          </p>

          <a
            href={SMART_LINK_URL}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="block w-full text-center px-4 py-3 text-sm font-semibold bg-[#46d369] text-[#0a0a0f] rounded-lg hover:bg-[#3bc258] transition-colors mb-3"
          >
            Get Special Offer
          </a>

          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center px-4 py-2.5 text-sm border border-[#2CA5E0]/30 text-[#2CA5E0] hover:bg-[#2CA5E0]/10 transition-colors rounded-lg"
          >
            Join Telegram for Updates
          </a>
        </div>

        <button
          onClick={close}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center text-[#8e8ea0] hover:text-white rounded-full hover:bg-white/10 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
    </div>
  );
}
