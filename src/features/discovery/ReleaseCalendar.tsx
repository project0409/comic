"use client";

import { Calendar, Clock } from "lucide-react";
import { motion } from "framer-motion";
import type { ReleaseCalendarItem } from "@/lib/types";
import { Badge } from "@/components/Badge";
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
        <h2 className="font-display text-2xl tracking-wider text-white">Release Calendar</h2>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <motion.article
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
            className="sf-comic-panel sf-comic-surface group rounded-2xl border border-white/10 bg-surface/70 p-4 transition hover:border-primary/30"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <Badge tone={item.status === "ComingSoon" ? "primary" : "gold"}>
                {item.status === "ComingSoon" ? "Coming Soon" : "In Queue"}
              </Badge>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                {item.genre} / {item.subgenre}
              </span>
            </div>

            <h3 className="font-semibold text-white transition group-hover:text-highlight">{item.title}</h3>

            <div className="mt-3 flex items-center gap-2 text-xs text-muted">
              <Clock className="h-3.5 w-3.5" />
              <span>
                Release Date:{" "}
                <span className={cn(item.status === "InQueue" ? "text-gold" : "text-white/80")}>
                  {item.releaseDateLabel}
                </span>
              </span>
            </div>
          </motion.article>
        ))}
      </div>
    </motion.section>
  );
}
