"use client";

import { motion } from "framer-motion";
import type { Series } from "@/lib/types";
import { SeriesCard } from "./SeriesCard";

export function CarouselRow({ title, items }: { title: string; items: Series[] }) {
  return (
    <motion.section
      className="space-y-3"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.38, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl tracking-wider text-white drop-shadow-[0_0_14px_rgba(255,51,102,0.16)]">
          {title}
        </h2>
        <div className="text-xs text-muted">{items.length} series</div>
      </div>

      <motion.div
        className="flex gap-3 overflow-x-auto pb-3 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
