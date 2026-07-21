"use client";

import { useEffect, useState } from "react";

export default function AdblockerDetector() {
  const [blocked, setBlocked] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const wasDismissed = localStorage.getItem("adblock_dismissed");
    if (wasDismissed) return;

    const testAd = document.createElement("div");
    testAd.className = "adsbox ad-banner pub_300x250";
    testAd.style.cssText = "position:absolute;top:-999px;left:-999px;width:1px;height:1px;";
    document.body.appendChild(testAd);

    setTimeout(() => {
      const isBlocked = testAd.offsetHeight === 0 || testAd.clientHeight === 0 ||
        window.getComputedStyle(testAd).display === "none" ||
        window.getComputedStyle(testAd).visibility === "hidden";
      document.body.removeChild(testAd);
      if (isBlocked) setBlocked(true);
    }, 200);
  }, []);

  if (!blocked || dismissed) return null;

  const dismiss = () => {
    setDismissed(false);
    setBlocked(false);
    localStorage.setItem("adblock_dismissed", "1");
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-[#18181f] border border-[#2a2a3a] shadow-2xl w-full max-w-[400px] mx-4 rounded-2xl overflow-hidden animate-slide-up">
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-[#f5c542]/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-[#f5c542]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>
            </svg>
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Ad-blocker Detected</h2>
          <p className="text-sm text-[#8e8ea0] mb-6">
            Ads help us keep CineMax free for everyone. Please disable your ad-blocker or consider supporting us.
          </p>
          <div className="flex gap-3">
            <button
              onClick={dismiss}
              className="flex-1 px-4 py-2.5 text-sm border border-[#2a2a3a] text-[#8e8ea0] hover:text-white hover:border-[#f5c542]/30 transition-colors"
            >
              Dismiss
            </button>
            <a
              href="/support"
              onClick={dismiss}
              className="flex-1 px-4 py-2.5 text-sm bg-[#f5c542] text-[#0a0a0f] font-semibold hover:bg-[#e0b530] transition-colors text-center"
            >
              Support Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
