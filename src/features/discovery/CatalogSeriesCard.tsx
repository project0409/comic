"use client";

import Link from "@/compat/next-link";
import { Star, Bookmark } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/components/cn";
import { useVaultStore } from "@/store/vaultStore";
import { useToastStore } from "@/store/toastStore";
import type { Series } from "@/lib/types";
import { firstChapterBySeries } from "@/lib/mockData";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";

function formatReads(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K reads`;
  return `${n} reads`;
}

export function CatalogSeriesCard({ series }: { series: Series }) {
  const chaptersHref = `/series/${series.id}#chapters`;

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
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.38 }}
      className="sf-comic-card group overflow-hidden rounded-2xl bg-surface/70"
    >
      <div className="flex flex-col gap-4 p-4 md:p-5 sm:flex-row sm:items-stretch">
        <Link
          href={chaptersHref}
          className="relative shrink-0 overflow-hidden rounded-xl sm:w-36 md:w-44"
          aria-label={`Open chapters for ${series.title}`}
        >
          <div className="aspect-[3/4] w-full sm:aspect-auto sm:h-full sm:min-h-[180px]">
            <img
              src={series.coverUrl}
              alt={`${series.title} cover`}
              className="sf-comic-image h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="absolute left-2 top-2">
            <Badge tone="muted">{series.genre}</Badge>
          </div>
        </Link>

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-muted">
              <span className="font-semibold text-white/90">{series.writerName}</span>
              <span>|</span>
              <span>{formatReads(series.readers)}</span>
            </div>

            <Link href={chaptersHref} className="inline-block max-w-full" aria-label={`Open chapters for ${series.title}`}>
              <h3 className="sf-title-animate font-display text-xl font-bold tracking-wide text-white transition hover:text-highlight md:text-2xl">
                {series.title}
              </h3>
            </Link>

            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{series.description}</p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1 text-muted">
                Rating:
                <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                <span className="font-semibold text-white">{series.rating}</span>
              </span>
              <span className="text-muted">{series.chapterCount} Chapters</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {/* Bookmark Save Button */}
              <Button
                variant={isBookmarked ? "primary" : "outline"}
                size="sm"
                onClick={toggleBookmark}
                title={isBookmarked ? "Saved in Stories" : "Save Story"}
                className="px-2.5 rounded-xl"
              >
                <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-white text-white")} />
              </Button>
              <Link href={`/series/${series.id}`}>
                <Button variant="outline" size="sm" className="rounded-xl">
                  Details
                </Button>
              </Link>
              <Link href={`/read/${firstChapterBySeries[series.id] ?? series.id}`}>
                <Button variant="primary" size="sm" className="rounded-xl">
                  Read Ch. 1
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
