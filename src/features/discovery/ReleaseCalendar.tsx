"use client";

import { Calendar, Clock } from "lucide-react";
import { motion } from "framer-motion";
import type { ReleaseCalendarItem } from "@/lib/types";
import { cn } from "@/components/cn";

export function ReleaseCalendar({ items }: { items: ReleaseCalendarItem[] }) {
  return (
    <motion.section
      className="space-y-4"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.38, ease: "easeOut" }}
    >
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-primary" />
        <h2 className="font-display text-2xl font-bold tracking-wide text-white">Release Calendar</h2>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => {
          return (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="sf-comic-card sf-comic-surface group cursor-pointer p-4 md:p-5 rounded-2xl border border-white/10 select-none transition-all hover:border-primary/40 hover:shadow-lg"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                {/* Speech Bubble Badge with high contrast */}
                <div className="relative inline-flex items-center rounded-[999px_999px_999px_8px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2.5 py-1 text-[11px] font-bold tracking-wide shadow-sm">
                  {item.status === "ComingSoon" ? "Coming Soon" : "In Queue"}
                  <span className="absolute bottom-[-4px] left-[10px] w-1.5 h-1.5 border-l border-b border-amber-400/40 bg-amber-400/20 rotate-[-18deg]" />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                  {item.genre} / {item.subgenre}
                </span>
              </div>

              {/* Title in bright white text */}
              <h3 className="font-bold text-white transition-colors duration-200 group-hover:text-primary text-base md:text-lg">
                {item.title}
              </h3>

              <div className="mt-3 flex items-center gap-2 text-xs text-muted">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span>
                  Release Date:{" "}
                  <span className={cn("font-medium", item.status === "InQueue" ? "text-amber-400 font-semibold" : "text-white/80")}>
                    {item.releaseDateLabel}
                  </span>
                </span>
              </div>
            </motion.article>
          );
        })}
      </div>
    </motion.section>
  );
}
