"use client";

import { useEffect, useRef, useState } from "react";

const ONESIGNAL_APP_ID = "YOUR_ONESIGNAL_APP_ID";

export default function PushNotificationRegistrar() {
  const [subscribed, setSubscribed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const dismissedRef = useRef(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (ONESIGNAL_APP_ID === "YOUR_ONESIGNAL_APP_ID") return;

    const dismissed = localStorage.getItem("push_dismissed");
    if (dismissed) { dismissedRef.current = true; return; }

    navigator.serviceWorker.ready.then((reg) => {
      return reg.pushManager.getSubscription();
    }).then((sub) => {
      if (sub) {
        setSubscribed(true);
      } else if (!dismissedRef.current) {
        setTimeout(() => setShowPrompt(true), 15000);
      }
    }).catch(() => {});
  }, []);

  const subscribe = async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: "",
      });
      setSubscribed(true);
      setShowPrompt(false);
    } catch {
      setShowPrompt(false);
    }
  };

  const dismiss = () => {
    setShowPrompt(false);
    dismissedRef.current = true;
    localStorage.setItem("push_dismissed", "1");
  };

  if (!showPrompt || subscribed) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-3 right-3 md:left-auto md:right-6 z-[90] animate-slide-up">
      <div className="bg-[#18181f] border border-[#2a2a3a] shadow-2xl rounded-xl p-4 max-w-[340px] md:ml-auto">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#f5c542]/10 flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-[#f5c542]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white mb-0.5">Stay Updated</p>
            <p className="text-xs text-[#8e8ea0] mb-3">Get notified when new movies & series are added</p>
            <div className="flex gap-2">
              <button
                onClick={subscribe}
                className="flex-1 px-3 py-2 text-xs font-semibold bg-[#f5c542] text-[#0a0a0f] rounded-lg hover:bg-[#e0b530] transition-colors"
              >
                Allow Notifications
              </button>
              <button
                onClick={dismiss}
                className="px-3 py-2 text-xs text-[#8e8ea0] hover:text-white border border-[#2a2a3a] rounded-lg transition-colors"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
