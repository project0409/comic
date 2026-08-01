"use client";

import Link from "@/compat/next-link";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
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

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.38 }}
      className="sf-comic-panel sf-comic-surface group overflow-hidden rounded-2xl border border-white/10 bg-surface/70"
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
        </Link>

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-muted">
              <span className="font-semibold text-white/90">{series.writerName}</span>
              <span>|</span>
              <span>{formatReads(series.readers)}</span>
            </div>

            <Link href={chaptersHref} className="inline-block max-w-full" aria-label={`Open chapters for ${series.title}`}>
              <h3 className="sf-title-animate font-display text-xl tracking-wide text-white transition hover:text-highlight md:text-2xl">
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
              <Link href={`/series/${series.id}`}>
                <Button variant="outline" size="sm">
                  Details
                </Button>
              </Link>
              <Link href={`/read/${firstChapterBySeries[series.id] ?? series.id}`}>
                <Button variant="primary" size="sm">
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
