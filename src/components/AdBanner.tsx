"use client";

import { useEffect, useRef } from "react";

const AD_SCRIPT = "https://pl30358094.effectivecpmnetwork.com/5b32e232715e9ba2b90136af474ea24d/invoke.js";
const AD_CONTAINER_ID = "container-5b32e232715e9ba2b90136af474ea24d";

export default function AdBanner() {
  const adRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    if (adRef.current) {
      const existing = document.getElementById(AD_CONTAINER_ID);
      if (!existing) {
        const script = document.createElement("script");
        script.src = AD_SCRIPT;
        script.async = false;
        (script as any).data_cfasync = "false";
        adRef.current.appendChild(script);
        loadedRef.current = true;
      }
    }
  }, []);

  return (
    <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 my-6 md:my-8">
      <div className="text-center mb-2">
        <span className="text-[9px] text-[#8e8ea0]/50 uppercase tracking-widest">Advertisement</span>
      </div>
      <div ref={adRef} className="flex justify-center min-h-[100px] bg-[#12121a] border border-[#2a2a3a] rounded-lg overflow-hidden" />
    </div>
  );
}
