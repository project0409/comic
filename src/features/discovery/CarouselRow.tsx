"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Series } from "@/lib/types";
import { SeriesCard } from "./SeriesCard";

export function CarouselRow({ title, items }: { title: string; items: Series[] }) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft } = scrollRef.current;
      const offset = direction === "left" ? -280 : 280;
      scrollRef.current.scrollTo({ left: scrollLeft + offset, behavior: "smooth" });
    }
  };

  return (
    <motion.section
      className="space-y-4"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.38, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold tracking-wide text-white">
          {title}
        </h2>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1.5 sm:flex">
            <button
              onClick={() => handleScroll("left")}
              className="sf-clickable grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-white/5 text-muted hover:border-primary/30 hover:bg-white/8 hover:text-white"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleScroll("right")}
              className="sf-clickable grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-white/5 text-muted hover:border-primary/30 hover:bg-white/8 hover:text-white"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="text-xs text-muted">{items.length} series</div>
        </div>
      </div>

      <motion.div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-6 pt-6 -mt-5 -mb-3 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        initial={{ opacity: 0, y: 6 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35 }}
      >
        {items.map((s) => (
          <SeriesCard key={s.id} series={s} />
        ))}
      </motion.div>
    </motion.section>
  );
}
