"use client";

import { useState, useEffect, useCallback } from "react";

const SMART_LINK_URL = "https://omg10.com/4/10635439";

interface DownloadGateProps {
  open: boolean;
  onClose: () => void;
  onVerified: () => void;
}

export default function DownloadGate({ open, onClose, onVerified }: DownloadGateProps) {
  const [step, setStep] = useState<"verify" | "countdown" | "done">("verify");
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (!open) {
      setStep("verify");
      setCountdown(10);
    }
  }, [open]);

  const handleVerify = useCallback(() => {
    setStep("countdown");
    setCountdown(10);
  }, []);

  useEffect(() => {
    if (step !== "countdown") return;
    if (countdown <= 0) {
      setStep("done");
      return;
    }
    const timer = setTimeout(() => setCountdown((p) => p - 1), 1000);
    return () => clearTimeout(timer);
  }, [step, countdown]);

  const handleDownload = useCallback(() => {
    onVerified();
    onClose();
  }, [onVerified, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-[#18181f] border border-[#2a2a3a] shadow-2xl w-full sm:max-w-[420px] sm:mx-4 rounded-t-2xl sm:rounded-2xl animate-slide-up sm:animate-popup overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a3a]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#f5c542]/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-[#f5c542]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                {step === "verify" && "Verification Required"}
                {step === "countdown" && "Preparing Download..."}
                {step === "done" && "Download Ready"}
              </h3>
              <p className="text-[11px] text-[#8e8ea0] mt-0.5">Complete the step to continue</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#8e8ea0] hover:text-white text-lg leading-none p-1">&times;</button>
        </div>

        <div className="p-5">
          {step === "verify" && (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[#f5c542]/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-[#f5c542]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
              </div>
              <p className="text-sm text-white font-semibold mb-3">How to Verify</p>

              <div className="text-left space-y-3 mb-5">
                <div className="flex items-start gap-3 bg-[#1a1a26] rounded-lg p-3 border border-[#2a2a3a]">
                  <span className="w-5 h-5 rounded-full bg-[#f5c542] text-[#0a0a0f] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <div>
                    <p className="text-xs text-white font-medium">Click the verify button below</p>
                    <p className="text-[10px] text-[#8e8ea0] mt-0.5">A new page will open with the offer</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-[#1a1a26] rounded-lg p-3 border border-[#2a2a3a]">
                  <span className="w-5 h-5 rounded-full bg-[#f5c542] text-[#0a0a0f] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <div>
                    <p className="text-xs text-white font-medium">Wait 5-10 seconds on that page</p>
                    <p className="text-[10px] text-[#8e8ea0] mt-0.5">Let the offer load fully</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-[#1a1a26] rounded-lg p-3 border border-[#2a2a3a]">
                  <span className="w-5 h-5 rounded-full bg-[#f5c542] text-[#0a0a0f] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <div>
                    <p className="text-xs text-white font-medium">Come back here</p>
                    <p className="text-[10px] text-[#8e8ea0] mt-0.5">Your download will be ready</p>
                  </div>
                </div>
              </div>

              <a
                href={SMART_LINK_URL}
                target="_blank"
                rel="noopener noreferrer sponsored"
                onClick={handleVerify}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#f5c542] text-[#0a0a0f] text-sm font-bold rounded-lg hover:bg-[#e0b530] transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                Verify Now
              </a>
            </div>
          )}

          {step === "countdown" && (
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="35" fill="none" stroke="#2a2a3a" strokeWidth="4" />
                  <circle
                    cx="40" cy="40" r="35" fill="none" stroke="#f5c542" strokeWidth="4"
                    strokeDasharray={`${2 * Math.PI * 35}`}
                    strokeDashoffset={`${2 * Math.PI * 35 * (1 - (10 - countdown) / 10)}`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-[#f5c542]">{countdown}</span>
                </div>
              </div>
              <p className="text-sm text-white font-semibold mb-1">Almost Ready</p>
              <p className="text-xs text-[#8e8ea0]">Your download will start in {countdown} seconds</p>
              <div className="h-1.5 bg-[#2a2a3a] rounded-full mt-4 overflow-hidden">
                <div
                  className="h-full bg-[#f5c542] transition-all duration-1000"
                  style={{ width: `${((10 - countdown) / 10) * 100}%` }}
                />
              </div>
            </div>
          )}

          {step === "done" && (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[#46d369]/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-[#46d369]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <p className="text-sm text-white font-semibold mb-1">Download Ready!</p>
              <p className="text-xs text-[#8e8ea0] mb-5">Click below to start downloading</p>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#46d369] text-[#0a0a0f] text-sm font-bold rounded-lg hover:bg-[#3bc258] transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
