import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Download, Smartphone, Monitor, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Download CineMax APK",
  description: "Download CineMax app for free. Stream thousands of movies and series in HD on Android.",
};

const features = [
  { title: "HD Streaming", desc: "Watch movies and series in full HD quality with adaptive streaming." },
  { title: "Offline Download", desc: "Download content to watch offline anywhere, anytime." },
  { title: "Multi Language", desc: "Available with multiple language audio and subtitles." },
  { title: "No Ads", desc: "Enjoy an uninterrupted ad-free viewing experience." },
];

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] overflow-hidden">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#f5c542]/5 to-transparent pointer-events-none" />
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-16 sm:pb-24 relative">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#f5c542]/10 border border-[#f5c542]/20 text-[#f5c542] text-xs font-semibold mb-6">
                <Download className="w-3.5 h-3.5" />
                LATEST RELEASE
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white leading-tight mb-4">
                Download <span className="text-[#f5c542]">CineMax</span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-[#8e8ea0] mb-8 max-w-lg mx-auto md:mx-0">
                Stream thousands of premium movies and TV series in stunning HD quality. Fast, free, and completely ad-free.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3 justify-center md:justify-start">
                <a
                  href="#download"
                  className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-[#f5c542] text-[#0a0a0f] text-sm sm:text-base font-bold hover:bg-[#e0b530] transition-colors w-full sm:w-auto justify-center"
                >
                  <Download className="w-5 h-5" />
                  Download APK
                </a>
                <div className="flex items-center gap-4 text-xs text-[#8e8ea0]">
                  <span>v2.1.0</span>
                  <span>|</span>
                  <span>45 MB</span>
                  <span>|</span>
                  <span>Android 7+</span>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0">
              <div className="relative w-[200px] sm:w-[240px] md:w-[280px] aspect-[9/16] bg-[#12121a] border border-[#2a2a3a] shadow-2xl shadow-[#f5c542]/10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#f5c542]/10 via-transparent to-[#0a0a0f]" />
                <div className="absolute top-0 left-0 right-0 h-6 bg-[#0a0a0f]/80 flex items-center justify-center">
                  <div className="w-16 h-1 bg-[#2a2a3a]" />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#f5c542] flex items-center justify-center">
                    <span className="text-[#0a0a0f] font-bold text-2xl sm:text-3xl">C</span>
                  </div>
                  <span className="text-lg sm:text-xl font-bold text-white">CineMax</span>
                  <span className="text-[10px] sm:text-xs text-[#8e8ea0]">v2.1.0</span>
                  <div className="w-full space-y-2 mt-2">
                    <div className="h-2 bg-[#2a2a3a] w-full" />
                    <div className="h-2 bg-[#2a2a3a] w-3/4" />
                    <div className="h-2 bg-[#2a2a3a] w-5/6" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="download" className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="bg-[#12121a] border border-[#2a2a3a] p-6 sm:p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">CineMax APK</h2>
              <p className="text-xs sm:text-sm text-[#8e8ea0] mb-4">
                Latest version with bug fixes and performance improvements. Install directly on your Android device.
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs text-[#8e8ea0]">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-[#f5c542]" />
                  <span>Version 2.1.0</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-[#f5c542]" />
                  <span>45 MB</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-[#f5c542]" />
                  <span>Android 7.0+</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-[#f5c542]" />
                  <span>Free Download</span>
                </div>
              </div>
            </div>
            <a
              href="/CineMax-v2.1.0.apk"
              download
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#f5c542] text-[#0a0a0f] text-sm font-bold hover:bg-[#e0b530] transition-colors w-full md:w-auto justify-center"
            >
              <Download className="w-5 h-5" />
              Download v2.1.0
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-10">Why CineMax?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-[#12121a] border border-[#2a2a3a] p-5 sm:p-6 hover:border-[#f5c542]/20 transition-colors">
              <h3 className="text-sm sm:text-base font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-xs sm:text-sm text-[#8e8ea0] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="bg-[#12121a] border border-[#2a2a3a] p-6 sm:p-8">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-4">How to Install</h2>
          <div className="space-y-3 sm:space-y-4">
            {[
              { step: "1", text: 'Tap "Download APK" above and save the file to your device.' },
              { step: "2", text: 'Go to Settings > Security > enable "Unknown Sources".' },
              { step: "3", text: "Open the downloaded APK file and tap Install." },
              { step: "4", text: "Open CineMax and start streaming!" },
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-3">
                <div className="w-6 h-6 flex-shrink-0 bg-[#f5c542] text-[#0a0a0f] flex items-center justify-center text-xs font-bold">
                  {s.step}
                </div>
                <p className="text-xs sm:text-sm text-[#8e8ea0] pt-0.5">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-16 sm:pb-24 text-center">
        <p className="text-xs text-[#8e8ea0]">
          CineMax is a free streaming platform. Download the APK to access all features on your Android device.
        </p>
      </div>
    </div>
  );
}
