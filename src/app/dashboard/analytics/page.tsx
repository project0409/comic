"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import Link from "@/compat/next-link";
import { useRouter, useSearchParams } from "@/compat/next-navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  BarChart3,
  ChevronRight,
  Star,
  MessageSquare,
  Bookmark,
  Calendar,
  Layers,
  Sparkles,
  Info,
  Clock,
  Flame,
  Eye
} from "lucide-react";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { RequireAuth } from "@/components/RequireAuth";
import { Navbar } from "@/features/discovery/Navbar";
import { cn } from "@/components/cn";
import { useAuthStore } from "@/store/authStore";
import { useCommentStore } from "@/store/commentStore";
import { useReviewStore } from "@/store/reviewStore";
import { useVaultStore } from "@/store/vaultStore";
import { seriesList, chaptersBySeries } from "@/lib/mockData";
import type { Series, Chapter } from "@/lib/types";

function AnalyticsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const userRole = useAuthStore((s) => s.role);
  const userEmail = useAuthStore((s) => s.email);
  const userDisplayName = useAuthStore((s) => s.displayName);

  const comments = useCommentStore((s) => s.comments);
  const reviews = useReviewStore((s) => s.reviews);
  const bookmarks = useVaultStore((s) => s.bookmarks);
  const reactions = useVaultStore((s) => s.reactions);
  const history = useVaultStore((s) => s.history);

  const [allSeries, setAllSeries] = useState<Series[]>(seriesList);
  const [loading, setLoading] = useState(true);

  // Fetch live series or fallback to mockData
  useEffect(() => {
    fetch("/api/series")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAllSeries(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const comicId = searchParams.get("comic");
  const chapterId = searchParams.get("chapter");

  // Determine comics belonging to the logged-in writer
  const writerComics = useMemo(() => {
    if (!allSeries.length) return [];
    const email = (userEmail || "").toLowerCase().trim();
    const name = (userDisplayName || "").toLowerCase().trim();

    // Check direct matches with writerName
    const matched = allSeries.filter((s) => {
      const wName = s.writerName.toLowerCase();
      return (
        (name && (wName.includes(name) || name.includes(wName))) ||
        (email && email.includes(wName.replace(/[^a-z]/g, "")))
      );
    });

    if (matched.length > 0) return matched;

    // Default for demo writer (writer@fyp.local) or writer role -> "S. Rava" / "Night City Blade"
    if (userRole === "writer" || email.includes("writer") || name.includes("writer")) {
      const ravaComics = allSeries.filter((s) => s.writerName.toLowerCase() === "s. rava");
      return ravaComics.length > 0 ? ravaComics : allSeries.slice(0, 2);
    }

    // Admin can see all comics
    if (userRole === "admin") {
      return allSeries;
    }

    // Default fallback so analytics is always viewable
    const defaultComics = allSeries.filter((s) => s.writerName.toLowerCase() === "s. rava");
    return defaultComics.length > 0 ? defaultComics : allSeries.slice(0, 1);
  }, [allSeries, userEmail, userDisplayName, userRole]);

  // Selected Comic (Level 2 & 3)
  const selectedComic = useMemo(() => {
    if (!comicId) return null;
    return allSeries.find((s) => s.id === comicId) ?? null;
  }, [allSeries, comicId]);

  // Chapters for selected comic
  const comicChapters = useMemo(() => {
    if (!selectedComic) return [];
    return chaptersBySeries[selectedComic.id] ?? [];
  }, [selectedComic]);

  // Selected Chapter (Level 3)
  const selectedChapter = useMemo(() => {
    if (!selectedComic || !chapterId) return null;
    return comicChapters.find((c) => c.id === chapterId) ?? null;
  }, [selectedComic, chapterId, comicChapters]);

  // Navigation Handlers
  const handleSelectComic = (id: string) => {
    router.push(`/dashboard/analytics?comic=${encodeURIComponent(id)}`);
  };

  const handleSelectChapter = (cId: string) => {
    if (selectedComic) {
      router.push(
        `/dashboard/analytics?comic=${encodeURIComponent(selectedComic.id)}&chapter=${encodeURIComponent(cId)}`
      );
    }
  };

  const handleBackToAll = () => {
    router.push("/dashboard/analytics");
  };

  const handleBackToComic = () => {
    if (selectedComic) {
      router.push(`/dashboard/analytics?comic=${encodeURIComponent(selectedComic.id)}`);
    } else {
      router.push("/dashboard/analytics");
    }
  };

  // Comic-level analytics metrics
  const comicAnalytics = useMemo(() => {
    if (!selectedComic) return null;

    const comicComments = comments.filter(
      (c) =>
        c.seriesId === selectedComic.id ||
        c.seriesName.toLowerCase() === selectedComic.title.toLowerCase()
    );

    const comicReviews = reviews.filter((r) => r.seriesId === selectedComic.id);
    const comicBookmarks = bookmarks.filter(
      (b) => b.seriesName.toLowerCase() === selectedComic.title.toLowerCase()
    );
    const comicReactions = reactions.filter(
      (r) => r.seriesName.toLowerCase() === selectedComic.title.toLowerCase()
    );
    const comicReads = history.filter((h) => h.seriesId === selectedComic.id);

    return {
      views: selectedComic.readers,
      chaptersCount: comicChapters.length || selectedComic.chapterCount,
      rating: selectedComic.rating,
      commentsCount: comicComments.length,
      reviewsCount: comicReviews.length,
      bookmarksCount: comicBookmarks.length,
      reactionsCount: comicReactions.length,
      recentReadsCount: comicReads.length
    };
  }, [selectedComic, comicChapters, comments, reviews, bookmarks, reactions, history]);

  // Chapter-level analytics metrics
  const chapterAnalytics = useMemo(() => {
    if (!selectedChapter || !selectedComic) return null;

    const chComments = comments.filter(
      (c) =>
        c.chapterId === selectedChapter.id &&
        (c.seriesId ? c.seriesId === selectedComic.id : true)
    );

    const chReviews = reviews.filter(
      (r) => r.seriesId === selectedComic.id && r.chapterId === selectedChapter.id
    );

    const chBookmarks = bookmarks.filter((b) => b.chapterId === selectedChapter.id);
    const chReactions = reactions.filter((r) => r.chapterId === selectedChapter.id);
    const chReads = history.filter(
      (h) => h.seriesId === selectedComic.id && h.chapterId === selectedChapter.id
    );

    const avgRating =
      chReviews.length > 0
        ? (chReviews.reduce((sum, r) => sum + r.rating, 0) / chReviews.length).toFixed(1)
        : null;

    // Reactions breakdown
    const reactionCounts: Record<string, number> = { "🔥": 0, "😭": 0, "🤯": 0, "💀": 0, "👏": 0 };
    for (const r of chReactions) {
      if (reactionCounts[r.emoji] !== undefined) {
        reactionCounts[r.emoji] += 1;
      }
    }

    return {
      status: selectedChapter.status,
      releaseDate: selectedChapter.releaseDateIso,
      comments: chComments,
      reviews: chReviews,
      bookmarksCount: chBookmarks.length,
      reactionsCount: chReactions.length,
      reactionCounts,
      readsCount: chReads.length,
      avgRating
    };
  }, [selectedChapter, selectedComic, comments, reviews, bookmarks, reactions, history]);

  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center">
        <div className="flex items-center gap-3 text-muted">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm">Loading analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 select-none">
      {/* Dynamic Breadcrumbs Navigation */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted">
        <Link
          href="/dashboard/writer"
          className="hover:text-white transition-colors"
        >
          Writers Hub
        </Link>
        <span>/</span>

        {selectedComic ? (
          <button
            onClick={handleBackToAll}
            className="hover:text-white transition-colors cursor-pointer"
          >
            All Comics
          </button>
        ) : (
          <span className="text-white">All Comics</span>
        )}

        {selectedComic && (
          <>
            <span>/</span>
            {selectedChapter ? (
              <button
                onClick={handleBackToComic}
                className="hover:text-white transition-colors cursor-pointer truncate max-w-[200px]"
              >
                {selectedComic.title}
              </button>
            ) : (
              <span className="text-white truncate max-w-[250px]">
                {selectedComic.title}
              </span>
            )}
          </>
        )}

        {selectedChapter && (
          <>
            <span>/</span>
            <span className="text-primary truncate max-w-[250px]">
              Chapter {selectedChapter.number} — {selectedChapter.title}
            </span>
          </>
        )}
      </div>

      {/* ========================================================================= */}
      {/* LEVEL 3 — CHAPTER-WISE ANALYTICS                                          */}
      {/* ========================================================================= */}
      {selectedComic && selectedChapter && chapterAnalytics ? (
        <motion.div
          key={`level-3-${selectedChapter.id}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Header Action & Title */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={handleBackToComic}
              className="sf-clickable inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-white/90 hover:bg-white/10 hover:text-white transition w-fit"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-primary" />
              <span>Back to {selectedComic.title} Analytics</span>
            </button>

            <Badge tone={selectedChapter.status === "Free" ? "primary" : "gold"}>
              {selectedChapter.status} Release
            </Badge>
          </div>

          {/* Chapter Details Banner */}
          <div className="rounded-3xl border border-white/10 bg-card p-6 md:p-8 space-y-2">
            <div className="text-xs font-semibold text-primary uppercase tracking-wider">
              Chapter Analytics
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-wide text-white">
              Chapter {selectedChapter.number} — {selectedChapter.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted pt-1">
              <span>Series: <strong className="text-white">{selectedComic.title}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                Release: <strong className="text-white">{selectedChapter.releaseDateIso}</strong>
              </span>
            </div>
          </div>

          {/* Chapter Metrics Grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-card p-4">
              <div className="flex items-center gap-2 text-xs text-muted">
                <MessageSquare className="h-3.5 w-3.5 text-primary" />
                Reader Comments
              </div>
              <div className="mt-2 text-2xl font-bold text-white tabular-nums">
                {chapterAnalytics.comments.length}
              </div>
              <div className="text-[11px] text-muted mt-0.5">Discussions on this chapter</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-card p-4">
              <div className="flex items-center gap-2 text-xs text-muted">
                <Star className="h-3.5 w-3.5 text-gold" />
                Chapter Reviews
              </div>
              <div className="mt-2 text-2xl font-bold text-white tabular-nums">
                {chapterAnalytics.reviews.length}
              </div>
              <div className="text-[11px] text-muted mt-0.5">
                {chapterAnalytics.avgRating ? `Average rating: ★ ${chapterAnalytics.avgRating}` : "No rating score yet"}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-card p-4">
              <div className="flex items-center gap-2 text-xs text-muted">
                <Flame className="h-3.5 w-3.5 text-rose-500" />
                Reader Reactions
              </div>
              <div className="mt-2 text-2xl font-bold text-white tabular-nums">
                {chapterAnalytics.reactionsCount}
              </div>
              <div className="text-[11px] text-muted mt-0.5">Live panel reactions</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-card p-4">
              <div className="flex items-center gap-2 text-xs text-muted">
                <Bookmark className="h-3.5 w-3.5 text-highlight" />
                Chapter Bookmarks
              </div>
              <div className="mt-2 text-2xl font-bold text-white tabular-nums">
                {chapterAnalytics.bookmarksCount}
              </div>
              <div className="text-[11px] text-muted mt-0.5">Saved by readers</div>
            </div>
          </div>

          {/* Chapter Content Details: Reactions Breakdown + Comments & Reviews */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Reactions breakdown */}
            <div className="rounded-3xl border border-white/10 bg-card p-6 space-y-4">
              <h2 className="font-display text-lg font-bold tracking-wide text-white flex items-center gap-2">
                <Flame className="h-4 w-4 text-primary" />
                Reactions Breakdown
              </h2>

              {chapterAnalytics.reactionsCount === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center text-xs text-muted">
                  No reactions recorded for this chapter yet.
                </div>
              ) : (
                <div className="grid grid-cols-5 gap-2 text-center pt-2">
                  {Object.entries(chapterAnalytics.reactionCounts).map(([emoji, count]) => (
                    <div
                      key={emoji}
                      className="rounded-2xl border border-white/10 bg-black/25 p-3 flex flex-col items-center gap-1"
                    >
                      <span className="text-xl">{emoji}</span>
                      <span className="text-sm font-bold text-white">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reader Reviews */}
            <div className="rounded-3xl border border-white/10 bg-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold tracking-wide text-white flex items-center gap-2">
                  <Star className="h-4 w-4 text-gold" />
                  Chapter Reviews ({chapterAnalytics.reviews.length})
                </h2>
                {chapterAnalytics.avgRating && (
                  <Badge tone="gold">★ {chapterAnalytics.avgRating}</Badge>
                )}
              </div>

              {chapterAnalytics.reviews.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center text-xs text-muted">
                  No reviews submitted for this chapter yet.
                </div>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {chapterAnalytics.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="rounded-2xl border border-white/10 bg-black/20 p-3.5 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-white">{rev.userName}</span>
                        <span className="text-gold font-bold">★ {rev.rating}</span>
                      </div>
                      <p className="text-xs text-muted leading-relaxed">{rev.reviewText}</p>
                      <div className="text-[10px] text-muted/60">
                        {new Date(rev.atIso).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Reader Comments for this Chapter */}
          <div className="rounded-3xl border border-white/10 bg-card p-6 space-y-4">
            <h2 className="font-display text-lg font-bold tracking-wide text-white flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              Reader Comments for Chapter {selectedChapter.number} ({chapterAnalytics.comments.length})
            </h2>

            {chapterAnalytics.comments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center text-xs text-muted">
                No reader comments recorded for this chapter yet.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {chapterAnalytics.comments.map((cm) => (
                  <div
                    key={cm.id}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-2 flex flex-col justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-white">{cm.readerName}</span>
                        {cm.pageIndex && (
                          <Badge tone="muted">Page {cm.pageIndex}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-white/80 leading-relaxed">&ldquo;{cm.body}&rdquo;</p>
                    </div>
                    <div className="text-[10px] text-muted pt-1 border-t border-white/5">
                      {new Date(cm.atIso).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      ) : selectedComic && comicAnalytics ? (
        /* ========================================================================= */
        /* LEVEL 2 — COMIC ANALYTICS + CHAPTERS                                      */
        /* ========================================================================= */
        <motion.div
          key={`level-2-${selectedComic.id}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          {/* Header Action & Comic Banner */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={handleBackToAll}
              className="sf-clickable inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-white/90 hover:bg-white/10 hover:text-white transition w-fit"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-primary" />
              <span>Back to All Comics</span>
            </button>

            <Badge tone="primary">Comic Overview</Badge>
          </div>

          {/* Comic Header Info */}
          <div className="sf-comic-panel sf-comic-surface rounded-3xl border border-white/10 bg-card p-6 md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <div className="aspect-[3/4] w-24 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                <img
                  src={selectedComic.coverUrl}
                  alt={selectedComic.title}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Badge tone="muted">{selectedComic.genre}</Badge>
                  <span className="text-xs text-muted">Author: <strong className="text-white">{selectedComic.writerName}</strong></span>
                </div>
                <h1 className="font-display text-2xl md:text-3xl font-bold tracking-wide text-white">
                  {selectedComic.title}
                </h1>
                <p className="text-xs md:text-sm text-muted line-clamp-2 max-w-2xl leading-relaxed">
                  {selectedComic.description}
                </p>
              </div>
            </div>
          </div>

          {/* Comic-Level Complete Analytics Metrics Grid */}
          <div className="space-y-3">
            <div className="font-display text-lg font-bold tracking-wider text-white">
              Comic Analytics
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-card p-4">
                <div className="flex items-center gap-2 text-xs text-muted">
                  <Eye className="h-3.5 w-3.5 text-primary" />
                  Total Views / Readers
                </div>
                <div className="mt-2 text-2xl font-bold text-white tabular-nums">
                  {comicAnalytics.views.toLocaleString()}
                </div>
                <div className="text-[11px] text-muted mt-0.5">Total readership reached</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-card p-4">
                <div className="flex items-center gap-2 text-xs text-muted">
                  <Layers className="h-3.5 w-3.5 text-highlight" />
                  Total Chapters
                </div>
                <div className="mt-2 text-2xl font-bold text-white tabular-nums">
                  {comicAnalytics.chaptersCount}
                </div>
                <div className="text-[11px] text-muted mt-0.5">Published episodes</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-card p-4">
                <div className="flex items-center gap-2 text-xs text-muted">
                  <Star className="h-3.5 w-3.5 text-gold" />
                  Average Rating
                </div>
                <div className="mt-2 text-2xl font-bold text-white tabular-nums">
                  ★ {comicAnalytics.rating}
                </div>
                <div className="text-[11px] text-muted mt-0.5">{comicAnalytics.reviewsCount} community reviews</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-card p-4">
                <div className="flex items-center gap-2 text-xs text-muted">
                  <Bookmark className="h-3.5 w-3.5 text-primary" />
                  Saved Bookmarks
                </div>
                <div className="mt-2 text-2xl font-bold text-white tabular-nums">
                  {comicAnalytics.bookmarksCount}
                </div>
                <div className="text-[11px] text-muted mt-0.5">In reader playlists</div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-card p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <MessageSquare className="h-3.5 w-3.5 text-primary" />
                    Total Comments
                  </div>
                  <div className="mt-1 text-2xl font-bold text-white tabular-nums">
                    {comicAnalytics.commentsCount}
                  </div>
                </div>
                <div className="text-right text-xs text-muted">
                  Across all chapters
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-card p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <Flame className="h-3.5 w-3.5 text-rose-500" />
                    Total Reactions
                  </div>
                  <div className="mt-1 text-2xl font-bold text-white tabular-nums">
                    {comicAnalytics.reactionsCount}
                  </div>
                </div>
                <div className="text-right text-xs text-muted">
                  Reader emotional responses
                </div>
              </div>
            </div>
          </div>

          {/* Chapter List Section */}
          <div className="rounded-3xl border border-white/10 bg-card p-6 md:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <h2 className="font-display text-xl font-bold tracking-wide text-white">
                  Chapters ({comicChapters.length})
                </h2>
                <p className="text-xs text-muted">
                  Select a chapter to open chapter-specific analytics
                </p>
              </div>
              <div className="text-xs text-muted">Click to inspect</div>
            </div>

            {comicChapters.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center text-sm text-muted">
                No chapters available for this comic.
              </div>
            ) : (
              <div className="space-y-2.5">
                {comicChapters.map((c) => {
                  const chCommentsCount = comments.filter((cm) => cm.chapterId === c.id).length;
                  const chReactionsCount = reactions.filter((rx) => rx.chapterId === c.id).length;
                  const chReviewsCount = reviews.filter((rv) => rv.chapterId === c.id && rv.seriesId === selectedComic.id).length;

                  return (
                    <motion.div
                      key={c.id}
                      whileHover={{ x: 4 }}
                      onClick={() => handleSelectChapter(c.id)}
                      className="group cursor-pointer rounded-2xl border border-white/8 bg-white/[0.02] p-4 hover:border-primary/40 hover:bg-white/[0.05] transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
                          #{c.number}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white group-hover:text-primary transition-colors">
                            Chapter {c.number} — {c.title}
                          </div>
                          <div className="text-xs text-muted flex items-center gap-2 mt-0.5">
                            <span>Released: {c.releaseDateIso}</span>
                            <span>•</span>
                            <Badge tone={c.status === "Free" ? "primary" : "gold"}>
                              {c.status}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted self-end sm:self-center">
                        {chCommentsCount > 0 && (
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3 text-primary" />
                            {chCommentsCount}
                          </span>
                        )}
                        {chReactionsCount > 0 && (
                          <span className="flex items-center gap-1">
                            <Flame className="h-3 w-3 text-rose-500" />
                            {chReactionsCount}
                          </span>
                        )}
                        {chReviewsCount > 0 && (
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-gold" />
                            {chReviewsCount}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 font-semibold text-primary pl-2 group-hover:translate-x-1 transition-transform">
                          <span>Analytics</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      ) : (
        /* ========================================================================= */
        /* LEVEL 1 — ALL WRITER'S COMICS SELECTION                                  */
        /* ========================================================================= */
        <motion.div
          key="level-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between border-b border-white/5 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                <h1 className="font-display text-3xl font-bold tracking-widest text-white">
                  Comic Analytics
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-muted mt-1">
                Select a comic series to view complete performance, readership, and chapter-wise analytics.
              </p>
            </div>
            <div className="text-xs text-muted">
              {writerComics.length} {writerComics.length === 1 ? "comic available" : "comics available"}
            </div>
          </div>

          {/* Comics List / Grid */}
          {writerComics.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-card/40 p-12 text-center space-y-4">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white/5 text-muted">
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <div className="text-base font-semibold text-white">No comics available for analytics.</div>
                <p className="text-xs text-muted max-w-sm mx-auto">
                  Comics assigned to your writer profile will automatically appear here once published or submitted.
                </p>
              </div>
              <Link href="/dashboard/writer">
                <Button variant="primary" size="sm" className="mt-2">
                  Go to Writer Dashboard
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {writerComics.map((comic) => {
                const totalCh = chaptersBySeries[comic.id]?.length || comic.chapterCount || 0;

                return (
                  <motion.div
                    key={comic.id}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.25 }}
                    onClick={() => handleSelectComic(comic.id)}
                    className="sf-comic-panel sf-comic-surface group cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-card p-4 hover:border-primary/50 hover:shadow-[0_12px_28px_rgba(255,51,102,0.15)] transition-all flex flex-col justify-between"
                  >
                    <div className="flex gap-4">
                      {/* Comic Cover */}
                      <div className="relative aspect-[3/4] w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40">
                        <img
                          src={comic.coverUrl}
                          alt={comic.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>

                      {/* Comic Basic Details */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <Badge tone="muted">{comic.genre}</Badge>
                        <h3 className="font-display font-bold text-base text-white group-hover:text-primary transition-colors line-clamp-1">
                          {comic.title}
                        </h3>
                        <div className="text-xs text-muted">
                          By <strong className="text-white/80">{comic.writerName}</strong>
                        </div>
                        <div className="text-[11px] text-muted pt-1">
                          {totalCh} {totalCh === 1 ? "Chapter" : "Chapters"}
                        </div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="mt-4 pt-3 border-t border-white/8 flex items-center justify-between text-xs">
                      <span className="text-muted">Click to inspect</span>
                      <span className="inline-flex items-center gap-1 font-bold text-primary group-hover:translate-x-1 transition-transform">
                        <span>View Analytics</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default function AnalyticsDashboardPage() {
  return (
    <RequireAuth roles={["writer", "admin"]}>
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-10 min-h-screen">
        <Suspense
          fallback={
            <div className="flex h-72 items-center justify-center text-muted text-sm">
              Loading analytics...
            </div>
          }
        >
          <AnalyticsContent />
        </Suspense>
      </div>
    </RequireAuth>
  );
}
