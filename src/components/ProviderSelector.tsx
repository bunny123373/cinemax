"use client";

import { useRouter, useSearchParams } from "next/navigation";

const PROVIDERS = ["all", "NetMirror"];

export default function ProviderSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("provider") || "all";

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      <span className="text-sm text-[#8e8ea0] shrink-0">Provider:</span>
      {PROVIDERS.map((p) => (
        <button
          key={p}
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString());
            if (p === "all") params.delete("provider");
            else params.set("provider", p);
            router.push(`/?${params.toString()}`);
          }}
          className={`shrink-0 px-3 py-1.5 text-xs font-medium transition-colors ${
            current === p
              ? "bg-[#f5c542] text-[#0a0a0f]"
              : "bg-[#1a1a2e] text-[#8e8ea0] hover:text-white border border-[#2a2a3a]"
          }`}
        >
          {p === "all" ? "All" : p}
        </button>
      ))}
    </div>
  );
}
