"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Download,
  Smartphone,
  Shield,
  Zap,
  Tv,
  Check,
  ChevronRight,
  Globe,
  X,
} from "lucide-react";

const FEATURES = [
  { icon: Zap, title: "Lightning Fast", desc: "Minimal buffering with optimized streaming servers" },
  { icon: Shield, title: "Ad-Free Experience", desc: "No popups or intrusive ads — just pure entertainment" },
  { icon: Tv, title: "Movies & Series", desc: "Thousands of titles across Bollywood, Hollywood, K-Drama & Anime" },
  { icon: Globe, title: "Subtitles & Multi-Audio", desc: "Built-in subtitles with multiple audio track support" },
  { icon: Globe, title: "HD Quality", desc: "Stream in up to 1080p with adaptive quality" },
  { icon: Globe, title: "Chromecast Support", desc: "Cast directly to your TV for the big screen experience" },
];

const STEPS = [
  { num: "1", title: "Download the APK", desc: "Tap the download button and wait for the file to save" },
  { num: "2", title: "Enable Unknown Sources", desc: "Go to Settings > Security > allow installs from unknown sources" },
  { num: "3", title: "Install & Open", desc: "Open the APK file, tap Install, and launch CineMax" },
];

export default function DownloadPage() {
  const [showPreview, setShowPreview] = useState(false);
  const apkSize = "75 MB";

  return (
    <div className="min-h-screen bg-[#0a0a0f] overflow-hidden">
      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#E50914]/8 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-16 relative">
          <div className="flex flex-col items-center text-center">
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 mb-6 drop-shadow-[0_0_40px_rgba(229,9,20,0.3)]">
              <Image src="/header_logo.png" alt="CineMax" fill className="object-contain" sizes="144px" priority />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E50914]/10 border border-[#E50914]/25 text-[#E50914] text-[11px] font-semibold tracking-wider uppercase mb-5">
              <Smartphone className="w-3 h-3" />
              Android App
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white mb-3 tracking-tight leading-tight">
              Download <span className="text-[#E50914]">CineMax</span>
            </h1>

            <p className="text-sm sm:text-base text-[#8e8ea0] max-w-lg mb-8 leading-relaxed">
              Stream thousands of movies and series in HD — free, fast, and ad-free. Your premium entertainment app for Android.
            </p>

            <a
              href="/cinemax.apk"
              download
              className="group inline-flex items-center gap-3 px-10 py-4 bg-[#E50914] text-white text-base font-bold rounded-lg hover:bg-[#b60710] transition-all duration-200 shadow-[0_0_30px_rgba(229,9,20,0.35)] hover:shadow-[0_0_40px_rgba(229,9,20,0.5)] hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download className="w-5 h-5" />
              Download APK
              <span className="text-xs font-normal opacity-70">{apkSize}</span>
              <ChevronRight className="w-4 h-4 opacity-60 group-hover:translate-x-0.5 transition-transform" />
            </a>

            <div className="flex items-center gap-4 mt-5 text-[11px] text-[#5a5a6a]">
              <span className="flex items-center gap-1">
                <Check className="w-3 h-3 text-[#1db954]" />
                Android 6.0+
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Check className="w-3 h-3 text-[#1db954]" />
                v2.0 Latest
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Check className="w-3 h-3 text-[#1db954]" />
                Free
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* App Preview */}
      <section className="max-w-[900px] mx-auto px-4 sm:px-6 mb-16">
        <div
          className="relative group cursor-pointer overflow-hidden rounded-xl border border-[#2a2a3a] bg-[#12121a]"
          onClick={() => setShowPreview(true)}
        >
          <div className="aspect-[16/9] relative">
            <Image
              src="/preview.png"
              alt="CineMax App Preview"
              fill
              className="object-cover"
              sizes="(max-width: 900px) 100vw, 900px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f]/80 via-transparent to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
              <div className="w-16 h-16 rounded-full bg-[#E50914]/90 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0a0a0f] to-transparent">
            <p className="text-xs text-[#8e8ea0]">Tap to preview</p>
          </div>
        </div>
      </section>

      {/* Preview Modal */}
      {showPreview && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowPreview(false)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            onClick={() => setShowPreview(false)}
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="relative w-full max-w-4xl aspect-video" onClick={(e) => e.stopPropagation()}>
            <Image src="/preview.png" alt="CineMax Preview" fill className="object-contain rounded-lg" sizes="90vw" />
          </div>
        </div>
      )}

      {/* Features Grid */}
      <section className="max-w-[900px] mx-auto px-4 sm:px-6 mb-16">
        <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-8">
          Why Choose <span className="text-[#E50914]">CineMax</span>?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-5 hover:border-[#E50914]/30 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#E50914]/10 flex items-center justify-center mb-3 group-hover:bg-[#E50914]/20 transition-colors">
                <f.icon className="w-5 h-5 text-[#E50914]" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">{f.title}</h3>
              <p className="text-xs text-[#8e8ea0] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How to Install */}
      <section className="max-w-[900px] mx-auto px-4 sm:px-6 mb-16">
        <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-8">
          How to <span className="text-[#E50914]">Install</span>
        </h2>
        <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-6 sm:p-8">
          <div className="space-y-6">
            {STEPS.map((step, i) => (
              <div key={step.num} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#E50914] flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(229,9,20,0.3)]">
                  <span className="text-white text-sm font-bold">{step.num}</span>
                </div>
                <div className="pt-2">
                  <h3 className="text-sm font-semibold text-white mb-0.5">{step.title}</h3>
                  <p className="text-xs text-[#8e8ea0]">{step.desc}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden sm:block absolute ml-5 mt-12 w-px h-6 bg-[#2a2a3a]" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-[900px] mx-auto px-4 sm:px-6 pb-20">
        <div className="relative overflow-hidden rounded-xl border border-[#E50914]/20 bg-gradient-to-r from-[#E50914]/10 via-[#12121a] to-[#E50914]/10 p-8 sm:p-12 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(229,9,20,0.06)_0%,transparent_70%)] pointer-events-none" />
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 relative">
            Ready to Start Watching?
          </h2>
          <p className="text-sm text-[#8e8ea0] mb-6 relative">
            Get the CineMax app and enjoy unlimited streaming today.
          </p>
          <a
            href="/cinemax.apk"
            download
            className="relative inline-flex items-center gap-2 px-8 py-3.5 bg-[#E50914] text-white text-sm font-bold rounded-lg hover:bg-[#b60710] transition-all duration-200 shadow-[0_0_20px_rgba(229,9,20,0.3)] hover:shadow-[0_0_30px_rgba(229,9,20,0.5)]"
          >
            <Download className="w-4 h-4" />
            Download CineMax v2.0
          </a>
        </div>
      </section>
    </div>
  );
}
