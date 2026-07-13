"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { IContent } from "@/types";
import ContentCard from "./ContentCard";

interface ContentRowProps {
  title: string;
  items: IContent[];
  link?: string;
}

export default function ContentRow({ title, items, link }: ContentRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const scroll = (direction: "left" | "right") => {
    if (!rowRef.current) return;
    const scrollAmount = rowRef.current.clientWidth;
    rowRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (!items.length) return null;

  return (
    <section className="relative overflow-hidden">
      <div className="flex items-center justify-between mb-4 px-4 md:px-8">
        <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
        {link && (
          <Link
            href={link}
            className="text-sm text-[#f5c542] hover:text-[#e0b530] transition-colors"
          >
            View All
          </Link>
        )}
      </div>
      <div
        className="relative"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <button
          onClick={() => scroll("left")}
          className={`absolute left-0 top-0 bottom-0 z-10 w-12 md:w-16 bg-gradient-to-r from-[#0a0a0f] to-transparent flex items-center justify-start pl-2 transition-opacity ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <div
          ref={rowRef}
          className="flex gap-3 overflow-x-auto scroll-smooth px-4 md:px-8 pb-10 pt-4 scrollbar-hide -my-4"
        >
          {items.map((item) => (
            <div key={item.slug} className="flex-shrink-0 w-[100px] sm:w-[120px] md:w-[150px] lg:w-[170px]">
              <ContentCard item={item} />
            </div>
          ))}
        </div>
        <button
          onClick={() => scroll("right")}
          className={`absolute right-0 top-0 bottom-0 z-10 w-12 md:w-16 bg-gradient-to-l from-[#0a0a0f] to-transparent flex items-center justify-end pr-2 transition-opacity ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </div>
    </section>
  );
}
