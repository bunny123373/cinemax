"use client";

import Image from "next/image";
import { Download, Smartphone, Shield, Zap, Tv, CheckCircle } from "lucide-react";

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] overflow-hidden">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-20">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#f5c542]/10 border border-[#f5c542]/20 text-[#f5c542] text-xs font-semibold mb-4">
            <Smartphone className="w-3.5 h-3.5" />
            CINEMAX APP
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">
            Download <span className="text-[#f5c542]">CineMax</span>
          </h1>
          <p className="text-sm text-[#8e8ea0] max-w-md mx-auto">
            Stream thousands of movies and series in HD. Free, fast, and ad-free entertainment on your device.
          </p>
        </div>

        <div className="bg-[#12121a] border border-[#2a2a3a] p-6 sm:p-8 text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <Image src="/favicon.png" alt="CineMax App" fill className="object-contain" sizes="96px" />
          </div>
          <h2 className="text-lg font-bold text-white mb-1">CineMax v1.2</h2>
          <p className="text-xs text-[#8e8ea0] mb-6">Latest version for Android</p>

          <a
            href="/cinemax.apk"
            download
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#f5c542] text-[#0a0a0f] text-sm font-bold hover:bg-[#e0b530] transition-colors"
          >
            <Download className="w-4 h-4" />
            Download APK
          </a>
          <p className="text-[10px] text-[#4a4a5a] mt-3">Requires Android 6.0+</p>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: Zap, title: "Fast Streaming", desc: "HD quality with minimal buffering" },
            { icon: Shield, title: "Ad-Free", desc: "No popups, no trackers" },
            { icon: Tv, title: "Movies & Series", desc: "Thousands of titles updated daily" },
            { icon: Download, title: "Offline Download", desc: "Save content to watch later" },
          ].map((feature) => (
            <div key={feature.title} className="bg-[#12121a] border border-[#2a2a3a] p-5 flex items-start gap-3">
              <feature.icon className="w-5 h-5 text-[#f5c542] mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-white mb-0.5">{feature.title}</h3>
                <p className="text-xs text-[#8e8ea0]">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-[#12121a] border border-[#2a2a3a] p-6">
          <h2 className="text-sm font-semibold text-white mb-3">How to Install</h2>
          <ol className="space-y-2 text-xs text-[#8e8ea0]">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-[#1db954] mt-0.5 flex-shrink-0" />
              Tap &quot;Download APK&quot; and wait for the file to download
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-[#1db954] mt-0.5 flex-shrink-0" />
              Open the downloaded APK file
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-[#1db954] mt-0.5 flex-shrink-0" />
              Enable &quot;Install from unknown sources&quot; if prompted
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-[#1db954] mt-0.5 flex-shrink-0" />
              Tap Install and enjoy CineMax
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
