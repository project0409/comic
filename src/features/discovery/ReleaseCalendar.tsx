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
              className="sf-calendar-card group cursor-pointer p-4 md:p-5 select-none"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                {/* Speech Bubble Badge precisely styled like image 4 */}
                <div className="relative inline-flex items-center rounded-[999px_999px_999px_8px] bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40 px-2.5 py-1 text-[11px] font-bold tracking-wide">
                  {item.status === "ComingSoon" ? "Coming Soon" : "In Queue"}
                  <span className="absolute bottom-[-4px] left-[10px] w-1.5 h-1.5 border-l border-b border-amber-200 dark:border-amber-900/40 bg-amber-100 dark:bg-amber-950/40 rotate-[-18deg]" />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                  {item.genre} / {item.subgenre}
                </span>
              </div>

              {/* Title matches requirements: neutral default, smooth transition to rose/pink on hover with underline */}
              <h3 className="font-bold text-slate-900 dark:text-white transition-colors duration-200 group-hover:text-rose-500 group-hover:dark:text-rose-400 group-hover:underline">
                {item.title}
              </h3>

              <div className="mt-3 flex items-center gap-2 text-xs text-muted">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  Release Date:{" "}
                  <span className={cn(item.status === "InQueue" ? "text-gold font-semibold" : "text-muted")}>
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
