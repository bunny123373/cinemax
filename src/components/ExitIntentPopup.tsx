"use client";

import { useEffect, useState, useCallback } from "react";

const SMART_LINK_URL = "https://www.effectivecpmnetwork.com/xyqk3ubv7?key=b47dcd9610166145c2197181fe08f2a5";
const TELEGRAM_URL = "https://t.me/MultiMirror";
const STORAGE_KEY = "exit_popup_shown";
const COOLDOWN = 86400000;

export default function ExitIntentPopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const lastShown = parseInt(localStorage.getItem(STORAGE_KEY) || "0");
    if (Date.now() - lastShown < COOLDOWN) return;

    const handler = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        setShow(true);
        localStorage.setItem(STORAGE_KEY, String(Date.now()));
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        setShow(true);
        localStorage.setItem(STORAGE_KEY, String(Date.now()));
      }
    };

    document.addEventListener("mouseleave", handler);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("mouseleave", handler);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const close = useCallback(() => setShow(false), []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={close}>
      <div className="bg-[#18181f] border border-[#2a2a3a] shadow-2xl w-full max-w-[380px] mx-4 rounded-2xl animate-popup overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-[#f5c542]/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#f5c542]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Wait! Don't Miss Out</h3>
          <p className="text-sm text-[#8e8ea0] mb-6">Check out our recommended offer before you go</p>

          <a
            href={SMART_LINK_URL}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#f5c542] text-[#0a0a0f] text-sm font-bold rounded-lg hover:bg-[#e0b530] transition-colors mb-3"
          >
            View Offer
          </a>

          <div>
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#2a2a3a] text-white text-sm font-medium rounded-lg hover:bg-[#3a3a4a] transition-colors"
            >
              Join Telegram
            </a>
          </div>
        </div>

        <button
          onClick={close}
          className="w-full py-2.5 text-xs text-[#8e8ea0] hover:text-white border-t border-[#2a2a3a] transition-colors"
        >
          No thanks
        </button>
      </div>
    </div>
  );
}
