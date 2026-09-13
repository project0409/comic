"use client";

import { useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles, BookOpen } from "lucide-react";
import type { Series } from "@/lib/types";
import { useVaultStore } from "@/store/vaultStore";
import { useAuthStore } from "@/store/authStore";
import {
  getContinueReadingItems,
  getPersonalizedRecommendations,
  getPopularRecommendations,
} from "@/lib/recommendations";
import { ContinueReadingCard } from "./ContinueReadingCard";
import { SeriesCard } from "./SeriesCard";

export function RecommendationsSection({ allSeries }: { allSeries: Series[] }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const history = useVaultStore((s) => s.history);
  const bookmarks = useVaultStore((s) => s.bookmarks);

  const continueScrollRef = useRef<HTMLDivElement | null>(null);
  const recScrollRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = (ref: React.RefObject<HTMLDivElement | null>, direction: "left" | "right") => {
    if (ref.current) {
      const { scrollLeft } = ref.current;
      const offset = direction === "left" ? -300 : 300;
      ref.current.scrollTo({ left: scrollLeft + offset, behavior: "smooth" });
    }
  };

  // 1. Next unread chapter items
  const continueItems = useMemo(() => {
    if (!isAuthenticated) return [];
    return getContinueReadingItems(history, allSeries);
  }, [isAuthenticated, history, allSeries]);

  const excludeSeriesIds = useMemo(() => {
    return continueItems.map((c) => c.series.id);
  }, [continueItems]);

  // 2. Personalized similar comic recommendations
  const personalizedItems = useMemo(() => {
    if (!isAuthenticated) return [];
    return getPersonalizedRecommendations(history, bookmarks, allSeries, excludeSeriesIds);
  }, [isAuthenticated, history, bookmarks, allSeries, excludeSeriesIds]);

  // 3. Fallback when user has no reading history
  const popularFallback = useMemo(() => {
    if (!isAuthenticated || personalizedItems.length > 0) return [];
    return getPopularRecommendations(allSeries, 6);
  }, [isAuthenticated, personalizedItems.length, allSeries]);

  // If logged out, do not show fake personalized recommendations
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-12">
      {/* 1. Continue Reading Row */}
      {continueItems.length > 0 && (
        <motion.section
          className="space-y-4"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.38, ease: "easeOut" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h2 className="font-display text-xl font-bold tracking-wide text-white">
                  Continue Reading
                </h2>
              </div>
              <p className="text-xs text-muted mt-0.5">
                Pick up where you left off with your next unread chapters
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-1.5 sm:flex">
                <button
                  onClick={() => handleScroll(continueScrollRef, "left")}
                  className="sf-clickable grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-white/5 text-muted hover:border-primary/30 hover:bg-white/8 hover:text-white"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleScroll(continueScrollRef, "right")}
                  className="sf-clickable grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-white/5 text-muted hover:border-primary/30 hover:bg-white/8 hover:text-white"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="text-xs text-muted">{continueItems.length} active</div>
            </div>
          </div>

          <motion.div
            ref={continueScrollRef}
            className="flex gap-4 overflow-x-auto pb-4 pt-2 -mt-2 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
          >
            {continueItems.map((item) => (
              <ContinueReadingCard key={item.series.id} item={item} />
            ))}
          </motion.div>
        </motion.section>
      )}

      {/* 2. Personalized or Fallback Recommendations */}
      {personalizedItems.length > 0 ? (
        <motion.section
          className="space-y-4"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.38, ease: "easeOut" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#22c55e]" />
                <h2 className="font-display text-xl font-bold tracking-wide text-white">
                  Recommended for You
                </h2>
              </div>
              <p className="text-xs text-muted mt-0.5">
                Stories picked based on your reading genres, authors, and bookmarks
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-1.5 sm:flex">
                <button
                  onClick={() => handleScroll(recScrollRef, "left")}
                  className="sf-clickable grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-white/5 text-muted hover:border-primary/30 hover:bg-white/8 hover:text-white"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleScroll(recScrollRef, "right")}
                  className="sf-clickable grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-white/5 text-muted hover:border-primary/30 hover:bg-white/8 hover:text-white"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="text-xs text-muted">{personalizedItems.length} titles</div>
            </div>
          </div>

          <motion.div
            ref={recScrollRef}
            className="flex gap-4 overflow-x-auto pb-6 pt-6 -mt-5 -mb-3 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
          >
            {personalizedItems.map((rec) => (
              <SeriesCard
                key={rec.series.id}
                series={rec.series}
                statusBadge={rec.score >= 4 ? "Popular" : "New"}
              />
            ))}
          </motion.div>
        </motion.section>
      ) : popularFallback.length > 0 ? (
        <motion.section
          className="space-y-4"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.38, ease: "easeOut" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-400" />
                <h2 className="font-display text-xl font-bold tracking-wide text-white">
                  Popular Comics For You
                </h2>
              </div>
              <p className="text-xs text-muted mt-0.5">
                Top-rated indie comics to start building your reading journey
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-1.5 sm:flex">
                <button
                  onClick={() => handleScroll(recScrollRef, "left")}
                  className="sf-clickable grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-white/5 text-muted hover:border-primary/30 hover:bg-white/8 hover:text-white"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleScroll(recScrollRef, "right")}
                  className="sf-clickable grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-white/5 text-muted hover:border-primary/30 hover:bg-white/8 hover:text-white"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="text-xs text-muted">{popularFallback.length} series</div>
            </div>
          </div>

          <motion.div
            ref={recScrollRef}
            className="flex gap-4 overflow-x-auto pb-6 pt-6 -mt-5 -mb-3 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
          >
            {popularFallback.map((series) => (
              <SeriesCard key={series.id} series={series} statusBadge="Popular" />
            ))}
          </motion.div>
        </motion.section>
      ) : null}
    </div>
  );
}
