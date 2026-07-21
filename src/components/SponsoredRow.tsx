"use client";

import Link from "next/link";
import Image from "next/image";

const SPONSORED_ITEMS = [
  {
    title: "Discover Premium VPN",
    description: "Browse securely with NordVPN",
    image: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    link: "https://nordvpn.com/pricing/coupon/?utm_source=referral&utm_medium=affiliates&utm_campaign=cinemax",
    tag: "Sponsored",
  },
];

export default function SponsoredRow() {
  if (SPONSORED_ITEMS.length === 0) return null;

  return (
    <div className="px-6">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-base md:text-lg font-semibold text-white">Sponsored</h2>
        <span className="px-1.5 py-0.5 text-[9px] font-medium bg-[#f5c542]/10 text-[#f5c542] border border-[#f5c542]/20 rounded">
          AD
        </span>
      </div>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
        {SPONSORED_ITEMS.map((item, i) => (
          <a
            key={i}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer sponsored nofollow"
            className="flex-shrink-0 w-[280px] group"
          >
            <div className="relative aspect-video rounded-lg overflow-hidden bg-[#1a1a26] border border-[#2a2a3a] group-hover:border-[#f5c542]/30 transition-colors">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover"
                sizes="280px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="text-xs text-[#8e8ea0]">{item.description}</p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
