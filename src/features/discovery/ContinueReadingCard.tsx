"use client";

import Link from "@/compat/next-link";
import { useRouter } from "@/compat/next-navigation";
import { BookOpen, Play, Bookmark, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import type { ContinueReadingItem } from "@/lib/recommendations";

export function ContinueReadingCard({ item }: { item: ContinueReadingItem }) {
  const router = useRouter();
  const { series, currentChapter, nextChapter, unreadCount } = item;

  const handleContinueReading = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/read/${nextChapter.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.28 }}
      className="shrink-0 w-full sm:w-[280px] md:w-[320px] relative"
    >
      <div className="sf-comic-panel sf-comic-surface group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-card p-4 transition-all duration-300 hover:border-primary/50 hover:shadow-[0_16px_36px_rgba(255,51,102,0.15)] h-full">
        {/* Top Header info */}
        <div className="flex items-start gap-3.5">
          {/* Comic Thumbnail with Play Overlay */}
          <Link
            href={`/series/${series.id}`}
            className="relative aspect-[3/4] w-20 shrink-0 overflow-hidden rounded-xl border border-white/10"
          >
            <img
              src={series.coverUrl}
              alt={series.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]">
              <Play className="h-6 w-6 text-white fill-white" />
            </div>
          </Link>

          {/* Series & Chapter Info */}
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge tone="primary">Continue</Badge>
              <Badge tone="muted">{series.genre}</Badge>
            </div>

            <Link href={`/series/${series.id}`}>
              <h3 className="font-semibold text-white truncate text-sm hover:text-primary transition-colors">
                {series.title}
              </h3>
            </Link>

            <p className="text-xs text-muted truncate">
              By {series.writerName}
            </p>

            <div className="pt-1 text-[11px] text-white/70 space-y-0.5">
              <div className="flex items-center gap-1 text-muted">
                <Clock className="h-3 w-3 text-primary" />
                <span>Last read: Ch. {currentChapter.number}</span>
              </div>
              <div className="font-semibold text-primary truncate">
                Next: Ch. {nextChapter.number} {nextChapter.title ? `· ${nextChapter.title}` : ""}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA Action Bar */}
        <div className="pt-3 mt-3 border-t border-white/8 flex items-center justify-between gap-2">
          <span className="text-[11px] font-medium text-muted">
            {unreadCount} {unreadCount === 1 ? "chapter" : "chapters"} left
          </span>
          <Button
            variant="primary"
            size="sm"
            onClick={handleContinueReading}
            className="gap-1.5 text-xs font-bold shadow-md shadow-primary/20"
          >
            <Play className="h-3 w-3 fill-current" />
            <span>Continue Reading</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
