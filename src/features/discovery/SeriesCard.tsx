"use client";

import Link from "@/compat/next-link";
import { Bookmark, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/Badge";
import { cn } from "@/components/cn";
import type { Series } from "@/lib/types";
import { firstChapterBySeries } from "@/lib/mockData";
import { useVaultStore } from "@/store/vaultStore";
import { useToastStore } from "@/store/toastStore";

export function SeriesCard({ series }: { series: Series }) {
  const statusBadge = series.earlyAccessPriceCoins ? "New" : series.readers > 100000 ? "Popular" : "Trending";
  const toast = useToastStore((s) => s.push);
  const bookmarks = useVaultStore((s) => s.bookmarks);
  const addBookmark = useVaultStore((s) => s.addBookmark);
  const removeBookmarkBySeries = useVaultStore((s) => s.removeBookmarkBySeries);

  const isSaved = bookmarks.some((b) => b.seriesName === series.title);

  const handleToggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSaved) {
      removeBookmarkBySeries(series.title);
      toast({
        tone: "default",
        title: "Story Removed",
        message: `Removed "${series.title}" from Saved Stories.`
      });
    } else {
      addBookmark({
        seriesName: series.title,
        chapterId: firstChapterBySeries[series.id] ?? "c1",
        pageIndex: 1,
        x: 0,
        y: 0,
        thumbUrl: series.coverUrl
      });
      toast({
        tone: "success",
        title: "Story Saved!",
        message: `Added "${series.title}" to your Saved Stories.`
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className="shrink-0 w-full sm:w-auto"
    >
      <Link
        href={`/series/${series.id}`}
        className={cn(
          "sf-comic-card group relative block w-full sm:w-[170px] min-w-[140px] overflow-hidden rounded-2xl border border-white/10 bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-[0_16px_36px_rgba(255,51,102,0.18)]"
        )}
      >
        {/* Status Badge */}
        <div className="absolute left-2 top-2 z-10">
          <Badge tone={statusBadge === "New" ? "gold" : statusBadge === "Popular" ? "primary" : "default"}>
            {statusBadge}
          </Badge>
        </div>

        {/* Quick Bookmark Button */}
        <button
          onClick={handleToggleSave}
          className="absolute right-2 top-2 z-20 grid h-7 w-7 place-items-center rounded-full border border-white/20 bg-black/60 backdrop-blur-md transition-all hover:scale-110 hover:border-primary hover:bg-black/80 shadow-md"
          aria-label={isSaved ? "Remove from Saved Stories" : "Save Story"}
          title={isSaved ? "Saved in Stories" : "Save Story"}
        >
          <Bookmark className={cn("h-3.5 w-3.5 transition-colors", isSaved ? "fill-primary text-primary" : "text-white")} />
        </button>

        {/* Cover Image with Centered Hover Read Button */}
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-t-2xl">
          <img
            src={series.coverUrl}
            alt={`${series.title} cover`}
            className="sf-comic-image h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          {/* Clean hover action pill */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100">
            <span className="rounded-full bg-primary px-3.5 py-1.5 text-xs font-bold text-white shadow-lg transition-transform group-hover:scale-105">
              Read Now
            </span>
          </div>
        </div>

        {/* Content Info */}
        <div className="space-y-2 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="sf-title-animate truncate font-semibold text-white transition duration-300 group-hover:text-primary">
                {series.title}
              </div>
              <div className="text-xs text-muted">{series.chapterCount} chapters</div>
            </div>
            {series.isLocked ? <Lock className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> : null}
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
