"use client";

import { motion } from "framer-motion";
import type { Series } from "@/lib/types";
import { SeriesCard } from "./SeriesCard";

export function CarouselRow({ title, items }: { title: string; items: Series[] }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl tracking-wider">{title}</h2>
        <div className="text-xs text-muted">{items.length} series</div>
      </div>

      <motion.div
        className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        initial={{ opacity: 0, y: 6 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35 }}
      >
        {items.map((s) => (
          <SeriesCard key={s.id} series={s} />
        ))}
      </motion.div>
    </section>
  );
}

