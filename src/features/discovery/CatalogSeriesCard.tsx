"use client";

import Link from "@/compat/next-link";
import { useRouter } from "@/compat/next-navigation";
import { Bookmark, Star } from "lucide-react";
import { motion } from "framer-motion";
import type { Series } from "@/lib/types";
import { firstChapterBySeries } from "@/lib/mockData";
import { canGuestRead } from "@/lib/guestReaderLimit";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { useVaultStore } from "@/store/vaultStore";
import { useToastStore } from "@/store/toastStore";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/components/cn";

function formatReads(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K reads`;
  return `${n} reads`;
}

export function CatalogSeriesCard({ series }: { series: Series }) {
  const router = useRouter();
  const chaptersHref = `/series/${series.id}#chapters`;
  const toast = useToastStore((s) => s.push);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const bookmarks = useVaultStore((s) => s.bookmarks);
  const addBookmark = useVaultStore((s) => s.addBookmark);
  const removeBookmarkBySeries = useVaultStore((s) => s.removeBookmarkBySeries);

  const isSaved = bookmarks.some((b) => b.seriesName === series.title);

  const handleToggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast({
        tone: "danger",
        title: "Login Required",
        message: "Please log in to save stories to your library."
      });
      router.push("/login");
      return;
    }

    if (isSaved) {
      removeBookmarkBySeries(series.title);
      toast({
        tone: "default",
        title: "Story Removed",
        message: `Removed "${series.title}" from your Saved Stories.`
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

  const handleReadCh1 = () => {
    const targetChapter = firstChapterBySeries[series.id] ?? "c1";
    if (!isAuthenticated && !canGuestRead(targetChapter)) {
      toast({
        tone: "danger",
        title: "Free Preview Limit Reached (2/2)",
        message: "You've read your 2 free preview comics! Please log in to continue reading."
      });
      router.push(`/login?redirectTo=/read/${targetChapter}`);
    } else {
      router.push(`/read/${targetChapter}`);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="sf-comic-panel sf-comic-surface group overflow-hidden rounded-2xl border border-white/10 bg-surface/70 transition-all duration-300 hover:border-primary/35 hover:shadow-[0_12px_36px_rgba(255,51,102,0.12)]"
    >
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-stretch">
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
          {/* Quick Bookmark button on image */}
          <button
            onClick={handleToggleSave}
            className="absolute right-2 top-2 z-10 grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-black/60 backdrop-blur-md transition-all hover:scale-110 hover:border-primary hover:bg-black/80"
            aria-label={isSaved ? "Remove from Saved Stories" : "Save Story"}
            title={isSaved ? "Saved in Stories" : "Save Story"}
          >
            <Bookmark className={cn("h-4 w-4 transition-colors", isSaved ? "fill-primary text-primary" : "text-white")} />
          </button>
        </Link>

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-muted">
              <span className="font-semibold text-white">{series.writerName}</span>
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

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1 text-muted">
                Rating:
                <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                <span className="font-semibold text-white">{series.rating}</span>
              </span>
              <span className="text-muted">{series.chapterCount} Chapters</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleSave}
                className={cn(
                  "gap-1.5 transition-colors",
                  isSaved ? "border-primary/50 text-primary bg-primary/10" : ""
                )}
              >
                <Bookmark className={cn("h-3.5 w-3.5", isSaved ? "fill-primary text-primary" : "")} />
                <span>{isSaved ? "Saved" : "Save"}</span>
              </Button>
              <Link href={`/series/${series.id}`}>
                <Button variant="outline" size="sm">
                  Details
                </Button>
              </Link>
              <Button variant="primary" size="sm" onClick={handleReadCh1}>
                Read Ch. 1
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
