"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Play, ChevronRight, Film, Tv, Download, Star } from "lucide-react";

interface LandingSplashProps {
  children: React.ReactNode;
}

export default function LandingSplash({ children }: LandingSplashProps) {
  const [entered, setEntered] = useState<boolean | null>(null);

  useEffect(() => {
    const flag = localStorage.getItem("cinemax_entered");
    if (flag) setEntered(true);
    else setEntered(false);
  }, []);

  const handleEnter = () => {
    localStorage.setItem("cinemax_entered", "1");
    setEntered(true);
  };

  if (entered === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="w-10 h-10 border-2 border-[#f5c542] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (entered) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] overflow-hidden">
      <div className="relative">
        <div className="absolute inset-0">
          <Image
            src="/preview.png"
            alt="CineMax Preview"
            fill
            className="object-cover object-top opacity-40"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/60 via-[#0a0a0f]/80 to-[#0a0a0f]" />
        </div>

        <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-16 flex flex-col items-center text-center">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-6">
            <Image src="/header_logo.png" alt="CineMax" fill className="object-contain" priority sizes="96px" />
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-3 leading-tight">
            Welcome to <span className="text-[#f5c542]">CineMax</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-[#8e8ea0] max-w-xl mb-8">
            Stream thousands of premium movies and TV series in stunning HD. Fast, free, and completely ad-free.
          </p>

          <div className="relative w-full max-w-[600px] aspect-video rounded-lg overflow-hidden border border-[#2a2a3a] shadow-2xl shadow-[#f5c542]/10 mb-10">
            <Image
              src="/preview.png"
              alt="CineMax Preview"
              fill
              className="object-cover"
              priority
              sizes="600px"
            />
          </div>

          <button
            onClick={handleEnter}
            className="inline-flex items-center gap-2.5 px-8 sm:px-10 py-3.5 sm:py-4 bg-[#f5c542] text-[#0a0a0f] text-base sm:text-lg font-bold hover:bg-[#e0b530] transition-colors shadow-lg shadow-[#f5c542]/20"
          >
            <Play className="w-5 h-5 fill-[#0a0a0f]" />
            Enter CineMax
          </button>

          <div className="grid grid-cols-3 gap-4 sm:gap-8 mt-12 max-w-[600px] w-full">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[#12121a] border border-[#2a2a3a] flex items-center justify-center">
                <Film className="w-5 h-5 text-[#f5c542]" />
              </div>
              <span className="text-xs sm:text-sm text-[#8e8ea0]">Movies</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[#12121a] border border-[#2a2a3a] flex items-center justify-center">
                <Tv className="w-5 h-5 text-[#f5c542]" />
              </div>
              <span className="text-xs sm:text-sm text-[#8e8ea0]">Series</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[#12121a] border border-[#2a2a3a] flex items-center justify-center">
                <Download className="w-5 h-5 text-[#f5c542]" />
              </div>
              <span className="text-xs sm:text-sm text-[#8e8ea0]">Downloads</span>
            </div>
          </div>

          <div className="mt-10 flex items-center gap-4 text-xs text-[#8e8ea0]">
            <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-[#f5c542] text-[#f5c542]" /> HD Quality</span>
            <span>|</span>
            <span>Free Streaming</span>
            <span>|</span>
            <span>No Ads</span>
          </div>
        </div>
      </div>
    </div>
  );
}
