"use client";

import Link from "@/compat/next-link";
import { Lock, Star, Play, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { cn } from "@/components/cn";
import { useVaultStore } from "@/store/vaultStore";
import { useToastStore } from "@/store/toastStore";
import { firstChapterBySeries } from "@/lib/mockData";
import type { Series } from "@/lib/types";

export function SeriesCard({ series }: { series: Series }) {
  const statusBadge = series.earlyAccessPriceCoins ? "New" : series.readers > 100000 ? "Popular" : "Trending";

  const bookmarks = useVaultStore((s) => s.bookmarks);
  const addBookmark = useVaultStore((s) => s.addBookmark);
  const removeBookmarkBySeries = useVaultStore((s) => s.removeBookmarkBySeries);
  const toast = useToastStore((s) => s.push);

  const isBookmarked = bookmarks.some((b) => b.seriesName === series.title);

  function toggleBookmark() {
    if (isBookmarked) {
      removeBookmarkBySeries(series.title);
      toast({ tone: "default", title: "Removed", message: "Story removed from Saved Stories." });
    } else {
      addBookmark({
        seriesName: series.title,
        chapterId: firstChapterBySeries[series.id] ?? "c1",
        pageIndex: 1,
        x: 0,
        y: 0,
        thumbUrl: series.coverUrl
      });
      toast({ tone: "success", title: "Saved", message: "Story saved in Saved Stories!" });
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.3 }}
      className="shrink-0"
    >
      <Link
        href={`/series/${series.id}`}
        className="sf-comic-card group relative block w-[170px] overflow-hidden rounded-2xl border border-white/10 bg-card transition-all duration-300"
      >
        <div className="absolute left-2 top-2 z-10">
          <Badge tone={statusBadge === "New" ? "gold" : statusBadge === "Popular" ? "primary" : "default"}>
            {statusBadge}
          </Badge>
        </div>

        {/* Cover Image Container */}
        <div className="aspect-[3/4] w-full overflow-hidden rounded-t-2xl relative">
          <img
            src={series.coverUrl}
            alt={`${series.title} cover`}
            className="sf-comic-image h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />

          {/* Premium Apple TV / Notion-style overlay: fades in only over the cover image area on hover */}
          <div className="absolute inset-0 bg-slate-950/75 p-3 flex flex-col justify-end text-left opacity-0 group-hover:opacity-100 transition-opacity duration-250 pointer-events-none group-hover:pointer-events-auto">
            {/* Rating */}
            <div className="flex items-center gap-1 text-[10px] font-semibold text-gold mb-1 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-250 delay-75">
              <Star className="h-2.5 w-2.5 fill-gold text-gold" />
              <span>{series.rating || "4.8"}</span>
              <span className="text-white/60 ml-0.5">({series.readers > 100000 ? "10k+" : "1k+"})</span>
            </div>

            {/* Description */}
            <p className="text-[10px] text-white/85 line-clamp-3 leading-relaxed mb-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-250 delay-100">
              {series.description || "Discover the story, read now, and share your reactions."}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-250 delay-150" onClick={(e) => e.stopPropagation()}>
              <div className="flex-1">
                <Button variant="primary" size="sm" className="w-full h-7 rounded-lg text-[10px] gap-1 px-2 py-0 bg-rose-600 hover:bg-rose-500 text-white border-none shadow-none">
                  <Play className="h-2.5 w-2.5 fill-white text-white" />
                  Read
                </Button>
              </div>
              <button
                className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5 text-white/80 hover:text-rose-500 hover:bg-white/10 transition-colors"
                aria-label="Like"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleBookmark();
                }}
              >
                <Heart className={cn("h-3 w-3 transition-colors duration-150", isBookmarked ? "fill-rose-500 text-rose-500" : "text-white/80")} />
              </button>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-3 space-y-2">
          <div className="flex items-start justify-between gap-1.5">
            <div className="min-w-0 flex-1">
              {/* Title transitions from standard text color to rose/pink on hover */}
              <div className="truncate font-semibold text-sm transition-colors duration-250 text-slate-900 dark:text-white group-hover:text-rose-500 group-hover:dark:text-rose-400">
                {series.title}
              </div>
              <div className="text-[11px] text-muted">{series.chapterCount} chapters</div>
            </div>
            {series.isLocked ? <Lock className="mt-0.5 h-3.5 w-3.5 text-gold shrink-0" /> : null}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone="muted">{series.genre}</Badge>
            {series.earlyAccessPriceCoins ? <Badge tone="gold">{series.earlyAccessPriceCoins} Coins</Badge> : null}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
