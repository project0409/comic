"use client";

import Link from "@/compat/next-link";
import { Lock } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/Badge";
import { cn } from "@/components/cn";
import type { Series } from "@/lib/types";

export function SeriesCard({ series }: { series: Series }) {
  const statusBadge = series.earlyAccessPriceCoins ? "New" : series.readers > 100000 ? "Popular" : "Trending";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      whileHover={{ rotateZ: -0.3 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className="shrink-0"
    >
      <Link
        href={`/series/${series.id}`}
        className={cn(
          "sf-comic-card group relative block w-[170px] overflow-hidden rounded-2xl border border-white/10 bg-card transition hover:border-primary/35 hover:bg-white/7"
        )}
      >
        <div className="absolute left-2 top-2 z-10">
          <Badge tone={statusBadge === "New" ? "gold" : statusBadge === "Popular" ? "primary" : "default"}>
            {statusBadge}
          </Badge>
        </div>

        <div className="aspect-[3/4] w-full overflow-hidden rounded-t-2xl">
          <img
            src={series.coverUrl}
            alt={`${series.title} cover`}
            className="sf-comic-image h-full w-full object-cover"
            loading="lazy"
          />
        </div>

        <div className="space-y-2 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="sf-title-animate truncate font-semibold transition duration-300">{series.title}</div>
              <div className="text-xs text-muted">{series.chapterCount} chapters</div>
            </div>
            {series.isLocked ? <Lock className="mt-0.5 h-4 w-4 text-gold" /> : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="muted">{series.genre}</Badge>
            {series.earlyAccessPriceCoins ? <Badge tone="gold">{series.earlyAccessPriceCoins} Coins</Badge> : null}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,51,102,0.1) 0%, rgba(0,229,255,0.05) 42%, rgba(0,0,0,0.72) 100%)"
            }}
          />
        </div>
      </Link>
    </motion.div>
  );
}
