"use client";

import Link from "next/link";

const TELEGRAM_URL = "https://t.me/MultiMirror";
const UPI_ID = "YOUR_UPI_ID@upi";
const USDT_ADDRESS = "YOUR_TRC20_ADDRESS";

function ArrowLeftIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
    </svg>
  );
}

function SendIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
    </svg>
  );
}

function QrCodeIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/>
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>
    </svg>
  );
}

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      <div className="max-w-[600px] mx-auto px-4 md:px-8 py-6 md:py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#8e8ea0] hover:text-[#f5c542] transition-colors mb-6 text-sm"
        >
          <ArrowLeftIcon />
          Back to Home
        </Link>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#f5c542]/10 flex items-center justify-center mx-auto mb-4">
            <HeartIcon />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Support CineMax</h1>
          <p className="text-sm text-[#8e8ea0]">
            If you enjoy using CineMax, consider supporting us to keep the platform running.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#5f259f]/20 flex items-center justify-center">
                <QrCodeIcon />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">UPI (India)</h2>
                <p className="text-xs text-[#8e8ea0]">Google Pay / PhonePe / Paytm</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-[#1a1a26] rounded-lg px-4 py-3 border border-[#2a2a3a]">
              <code className="flex-1 text-sm text-[#f5c542] font-mono select-all">{UPI_ID}</code>
              <button
                onClick={() => navigator.clipboard.writeText(UPI_ID)}
                className="text-[#8e8ea0] hover:text-[#f5c542] transition-colors shrink-0"
                title="Copy"
              >
                <CopyIcon />
              </button>
            </div>
          </div>

          <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#26a17b]/20 flex items-center justify-center">
                <WalletIcon />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">USDT (TRC20)</h2>
                <p className="text-xs text-[#8e8ea0]">Tether on Tron Network</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-[#1a1a26] rounded-lg px-4 py-3 border border-[#2a2a3a]">
              <code className="flex-1 text-xs text-[#26a17b] font-mono select-all break-all">{USDT_ADDRESS}</code>
              <button
                onClick={() => navigator.clipboard.writeText(USDT_ADDRESS)}
                className="text-[#8e8ea0] hover:text-[#26a17b] transition-colors shrink-0"
                title="Copy"
              >
                <CopyIcon />
              </button>
            </div>
          </div>

          <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#2CA5E0]/20 flex items-center justify-center">
                <SendIcon />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">Join Our Community</h2>
                <p className="text-xs text-[#8e8ea0]">Get updates, new releases & support</p>
              </div>
            </div>
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center px-4 py-3 text-sm font-medium bg-[#2CA5E0]/10 border border-[#2CA5E0]/30 text-[#2CA5E0] hover:bg-[#2CA5E0]/20 transition-colors rounded-lg"
            >
              Join Telegram Channel
            </a>
          </div>
        </div>

        <p className="text-center text-xs text-[#8e8ea0] mt-8">
          Every contribution helps us keep CineMax running and improve your experience.
        </p>
      </div>
    </main>
  );
}
