"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/Badge";
import { cn } from "@/components/cn";
import type { Series } from "@/lib/types";

export function SeriesCard({ series }: { series: Series }) {
  return (
    <motion.div
      whileHover={{ rotateZ: -0.3, y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className="shrink-0"
    >
      <Link
        href={`/series/${series.id}`}
        className={cn(
          "group relative block w-[170px] overflow-hidden rounded-2xl border border-white/10 bg-card transition hover:border-white/18 hover:bg-white/7"
        )}
      >
        <div
          className="aspect-[3/4] w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${series.coverUrl})` }}
        />

        <div className="space-y-2 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate font-semibold">{series.title}</div>
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
                "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.2) 55%, rgba(0,0,0,0.65) 100%)"
            }}
          />
        </div>
      </Link>
    </motion.div>
  );
}
