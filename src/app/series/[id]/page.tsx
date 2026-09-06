"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "@/compat/next-navigation";
import Link from "@/compat/next-link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Bookmark, ChevronRight, MessageSquare, Send, Star, X } from "lucide-react";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Tabs } from "@/components/Tabs";
import { cn } from "@/components/cn";
import type { Chapter, Series } from "@/lib/types";
import { SaveToPlaylistModal } from "@/components/SaveToPlaylistModal";
import { canGuestRead } from "@/lib/guestReaderLimit";
import { useUiStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { useCommentStore } from "@/store/commentStore";
import { useReviewStore } from "@/store/reviewStore";
import { useVaultStore } from "@/store/vaultStore";
import { getAuthorId, isTopAuthor, mockAuthors, seriesList } from "@/lib/mockData";
import { useAuthorStore } from "@/store/authorStore";
import { InstagramAuthorStar } from "@/components/InstagramAuthorStar";

type TabKey = "chapters" | "about" | "community";

export default function SeriesDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToastStore((s) => s.push);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const displayName = useAuthStore((s) => s.displayName);
  const userEmail = useAuthStore((s) => s.email);
  const comments = useCommentStore((s) => s.comments);
  const addComment = useCommentStore((s) => s.addComment);

  const reviews = useReviewStore((s) => s.reviews);
  const addOrUpdateReview = useReviewStore((s) => s.addOrUpdateReview);

  const seriesReviews = useMemo(() => reviews.filter((r) => r.seriesId === id), [reviews, id]);

  const averageRating = useMemo(() => {
    if (seriesReviews.length === 0) return "0.0";
    const sum = seriesReviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / seriesReviews.length).toFixed(1);
  }, [seriesReviews]);

  const breakdown = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    seriesReviews.forEach((r) => {
      const ratingKey = Math.round(r.rating) as 5 | 4 | 3 | 2 | 1;
      if (counts[ratingKey] !== undefined) {
        counts[ratingKey]++;
      }
    });
    const total = seriesReviews.length;
    return Object.keys(counts).reduce((acc, key) => {
      const numKey = Number(key) as 5 | 4 | 3 | 2 | 1;
      acc[numKey] = total > 0 ? Math.round((counts[numKey] / total) * 100) : 0;
      return acc;
    }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<5 | 4 | 3 | 2 | 1, number>);
  }, [seriesReviews]);

  const existingReview = useMemo(() => {
    if (!userEmail) return null;
    return seriesReviews.find((r) => r.userEmail === userEmail) ?? null;
  }, [seriesReviews, userEmail]);

  const [userRating, setUserRating] = useState(0);
  const [userHoverRating, setUserHoverRating] = useState(0);
  const [userReviewText, setUserReviewText] = useState("");

  useEffect(() => {
    if (existingReview) {
      setUserRating(existingReview.rating);
      setUserReviewText(existingReview.reviewText);
    } else {
      setUserRating(0);
      setUserReviewText("");
    }
  }, [existingReview]);

  function submitSeriesReview() {
    if (!userEmail) return;
    if (userRating === 0) {
      toast({ tone: "danger", title: "Rating required", message: "Please select a star rating." });
      return;
    }
    addOrUpdateReview({
      seriesId: id,
      userEmail,
      userName: displayName || userEmail.split("@")[0] || "Reader",
      rating: userRating,
      reviewText: userReviewText.trim()
    });
    toast({
      tone: "success",
      title: existingReview ? "Review Updated! ⭐" : "Review Submitted! ⭐",
      message: "Thank you for reviewing this comic series!"
    });
  }

  const searchParams = useSearchParams();
  const fromParam = searchParams?.get("from");

  const [series, setSeries] = useState<Series | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [tab, setTab] = useState<TabKey>("chapters");
  const [selectedChapterForFeedback, setSelectedChapterForFeedback] = useState<Chapter | null>(null);
  const [chRating, setChRating] = useState(0);
  const [chHoverRating, setChHoverRating] = useState(0);
  const [chReviewText, setChReviewText] = useState("");
  const [chCommentText, setChCommentText] = useState("");
  const [comicCommentText, setComicCommentText] = useState("");
  const setAmbient = useUiStore((s) => s.setAmbientColor);
  const bookmarks = useVaultStore((s) => s.bookmarks);
  const isSaved = series ? bookmarks.some((b) => b.seriesName === series.title) : false;
  const [playlistOpen, setPlaylistOpen] = useState(false);

  const followedIds = useAuthorStore((s) => s.followedAuthorIds);
  const toggleFollow = useAuthorStore((s) => s.toggleFollow);

  const author = useMemo(() => {
    if (!series) return null;
    return mockAuthors.find((a) => a.name.toLowerCase() === series.writerName.toLowerCase()) ?? null;
  }, [series]);

  const isFollowing = useMemo(() => {
    if (!author) return false;
    return followedIds.includes(author.id);
  }, [followedIds, author]);

  const authorComicsCount = useMemo(() => {
    if (!series) return 0;
    return seriesList.filter((s) => s.writerName.toLowerCase() === series.writerName.toLowerCase()).length;
  }, [series]);

  const handleToggleSave = () => {
    if (!isAuthenticated) {
      toast({
        tone: "danger",
        title: "Login Required",
        message: "Please log in to save stories to your library."
      });
      router.push("/login");
      return;
    }
    setPlaylistOpen(true);
  };

  useEffect(() => {
    fetch("/api/series")
      .then((r) => r.json())
      .then((list: Series[]) => {
        const s = list.find((x) => x.id === id) ?? null;
        setSeries(s);
        if (s) setAmbient(s.ambientColorHex);
      });
    fetch(`/api/series/${id}/chapters`)
      .then((r) => r.json())
      .then(setChapters)
      .catch(() => setChapters([]));
  }, [id, setAmbient]);

  const handleReadChapter = (chapterId: string) => {
    const returnQuery = fromParam === "/library" ? "?from=/library" : "?from=/";
    if (!isAuthenticated && !canGuestRead(chapterId)) {
      toast({
        tone: "danger",
        title: "Free Preview Limit Reached (2/2)",
        message: "You've read your 2 free preview comics! Please log in or create an account to continue reading."
      });
      router.push(`/login?redirectTo=/read/${chapterId}${returnQuery}`);
    } else {
      router.push(`/read/${chapterId}${returnQuery}`);
    }
  };

  function submitChapterFeedback() {
    if (!selectedChapterForFeedback || !userEmail) {
      if (!isAuthenticated) {
        toast({ tone: "danger", title: "Login Required", message: "Please log in to rate and review chapters." });
        router.push("/login");
      }
      return;
    }
    if (chRating === 0) {
      toast({ tone: "danger", title: "Rating required", message: "Please select 1 to 5 stars." });
      return;
    }
    addOrUpdateReview({
      seriesId: id,
      chapterId: selectedChapterForFeedback.id,
      userEmail,
      userName: displayName || userEmail.split("@")[0] || "Reader",
      rating: chRating,
      reviewText: chReviewText.trim()
    });
    toast({
      tone: "success",
      title: "Chapter Review Submitted! ⭐",
      message: `Your rating for Chapter ${selectedChapterForFeedback.number} has been saved.`
    });
  }

  function submitChapterModalComment() {
    if (!selectedChapterForFeedback || !series) return;
    const body = chCommentText.trim();
    if (!body) return;
    addComment({
      targetType: "Chapter",
      seriesId: series.id,
      seriesName: series.title,
      chapterId: selectedChapterForFeedback.id,
      readerName: displayName || "Reader",
      body
    });
    setChCommentText("");
    toast({
      tone: "success",
      title: "Comment Posted! 💬",
      message: `Your comment was posted to Chapter ${selectedChapterForFeedback.number}.`
    });
  }

  const heroStyle = useMemo(() => {
    return {
      background:
        "radial-gradient(900px 520px at 20% 10%, rgba(255,51,102,0.24), transparent 60%)," +
        "radial-gradient(900px 520px at 80% 20%, rgba(0,229,255,0.14), transparent 60%)," +
        "radial-gradient(760px 460px at 72% 82%, rgba(255,193,7,0.1), transparent 64%)," +
        "linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.72))"
    } as const;
  }, []);

  const comicComments = useMemo(
    () => comments.filter((comment) => comment.targetType === "Comic" && comment.seriesId === id),
    [comments, id]
  );

  function submitComicComment() {
    if (!series) return;
    const body = comicCommentText.trim();
    if (!body) return;
    addComment({
      targetType: "Comic",
      seriesId: series.id,
      seriesName: series.title,
      readerName: displayName || "Reader",
      body
    });
    setComicCommentText("");
  }

  if (!series) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="text-muted">Loading series…</div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh">
      <div className="relative overflow-hidden border-b border-white/8 bg-surface">
        <div className="absolute inset-0 opacity-70" style={heroStyle} />
        
        {/* Dedicated "Exit Comic" Navigation button */}
        <div className="relative mx-auto max-w-5xl px-4 pt-4 z-20">
          <Link
            href={fromParam === "/library" ? "/library" : "/"}
            className="sf-clickable inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-white/90 hover:bg-white/10 hover:text-white transition shadow-sm"
            title={fromParam === "/library" ? "Exit Comic: Back to Library" : "Exit Comic: Back to Home"}
          >
            <ArrowLeft className="h-4 w-4 text-primary" />
            <span>Exit Comic</span>
          </Link>
        </div>

        <motion.div
          className="relative mx-auto grid max-w-5xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[220px_1fr] md:py-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, ease: "easeOut" }}
        >
          <div className="aspect-[3/4] w-[220px] overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-primary/10">
            <img
              src={series.coverUrl}
              alt={`${series.title} cover`}
              className="sf-comic-image h-full w-full object-cover"
            />
          </div>

          <div className="space-y-3">
            <h1 className="font-display text-4xl font-bold tracking-widest text-white drop-shadow-[0_0_18px_rgba(255,51,102,0.18)] md:text-5xl">
              {series.title}
            </h1>
            <div className="text-sm text-white/80">
              by{" "}
              <Link
                href={`/author/${getAuthorId(series.writerName)}`}
                className="font-semibold text-primary hover:underline transition inline-flex items-center gap-1.5"
              >
                <span>{series.writerName}</span>
                {isTopAuthor(series.writerName) && (
                  <InstagramAuthorStar size={15} />
                )}
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="muted">{series.genre}</Badge>
              <Badge tone="primary">{series.readers.toLocaleString()} readers</Badge>
              {seriesReviews.length > 0 ? (
                <div className="flex items-center gap-1.5 text-xs bg-black/35 px-3 py-1.5 rounded-full border border-white/10 select-none">
                  <span className="text-amber-400 font-bold">★ {averageRating}</span>
                  <span className="text-white/60">({seriesReviews.length} {seriesReviews.length === 1 ? 'review' : 'reviews'})</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs bg-black/35 px-3 py-1.5 rounded-full border border-white/10 select-none">
                  <span className="text-white/40">No reviews yet</span>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleSave}
                className={cn(
                  "gap-1.5 h-8 text-xs transition-all border-white/10 hover:bg-white/10 hover:text-white text-white/90",
                  isSaved ? "border-primary/50 text-primary bg-primary/10 hover:bg-primary/15" : ""
                )}
              >
                <Bookmark className={cn("h-3.5 w-3.5", isSaved ? "fill-primary text-primary" : "")} />
                <span>{isSaved ? "Saved" : "Save to Playlist"}</span>
              </Button>
            </div>

            {/* Creator Badge Widget Card */}
            {author && (
              <div className="overflow-hidden rounded-2xl border-2 border-primary bg-white p-4 text-slate-900 shadow-xl max-w-xl my-2">
                <div className="flex flex-row items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
                  {/* Left Column: Avatar + Name info */}
                  <Link
                    href={`/author/${author.id}`}
                    className="flex items-center gap-3.5 group min-w-0"
                  >
                    <div className={cn(
                      "shrink-0 rounded-full flex items-center justify-center shadow-md transition-transform group-hover:scale-105",
                      author.isTopAuthor
                        ? "p-[2.5px] bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]"
                        : "border border-slate-200 bg-slate-100 p-1 shadow-inner"
                    )}>
                      <div className="h-13 w-13 rounded-full overflow-hidden bg-white flex items-center justify-center p-1">
                        <img
                          src={author.avatarUrl}
                          alt={author.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Story &amp; Art by
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="font-display font-black text-slate-900 tracking-wide text-base truncate group-hover:text-primary transition-colors">
                          {author.name}
                        </span>
                        {author.isTopAuthor ? (
                          <>
                            <InstagramAuthorStar size={18} />
                            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-purple-500/10 border border-amber-500/25 px-2 py-0.5 text-[10px] font-black text-rose-600 tracking-wider">
                              Top Author
                            </span>
                          </>
                        ) : (
                          /* Purple Verified Checkmark */
                          <svg className="h-4.5 w-4.5 shrink-0 text-[#7C3AED]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </Link>

                  {/* Right Column: Follow Button + Comics Count link */}
                  <div className="flex items-center gap-4 shrink-0 w-full justify-between sm:w-auto sm:justify-end">
                    <Button
                      variant={isFollowing ? "outline" : "primary"}
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFollow(author.id);
                      }}
                      className={cn(
                        "h-8 text-xs px-3.5 font-bold rounded-xl shadow-none",
                        isFollowing
                          ? "border-purple-600 text-purple-600 bg-purple-50 hover:bg-purple-100/50"
                          : "bg-purple-100 hover:bg-purple-200/80 text-purple-700 border-none"
                      )}
                    >
                      {isFollowing ? "Following" : "+ Follow"}
                    </Button>

                    <Link
                      href={`/author/${author.id}`}
                      className="text-xs font-black text-slate-500 hover:text-primary transition flex items-center gap-1"
                    >
                      <span>{authorComicsCount} {authorComicsCount === 1 ? "Comic" : "Comics"}</span>
                      <ChevronRight className="h-4 w-4 stroke-[2.5px] text-slate-400" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2">
              <Tabs<TabKey>
                value={tab}
                onChange={setTab}
                tabs={[
                  { value: "chapters", label: "Chapters", badge: String(chapters.length) },
                  { value: "about", label: "About" },
                  { value: "community", label: "Community Reactions" }
                ]}
              />
            </div>
          </div>
        </motion.div>
      </div>

      <motion.main
        className="mx-auto max-w-5xl space-y-6 px-4 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.36 }}
      >
        {tab === "chapters" ? (
          <div id="chapters" className="scroll-mt-28 space-y-3">
            {chapters.map((c) => {
              if (c.status === "ComingSoon") {
                return (
                  <motion.div
                    key={c.id}
                    className="relative overflow-hidden rounded-2xl border border-dashed border-white/20 bg-white/5 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 backdrop-blur-md"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/5 border border-white/10 text-lg shrink-0 select-none">
                        🚧
                      </div>
                      <div>
                        <div className="font-display text-lg tracking-wider font-semibold text-white">
                          Chapter {c.number}: Coming Soon
                        </div>
                        <p className="text-sm text-muted">
                          Stay tuned for exciting updates. Est. release: {new Date(c.releaseDateIso).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <Badge tone="muted" className="px-3 py-1.5 rounded-full border border-white/10 text-xs font-semibold">
                        Under Construction
                      </Badge>
                    </div>
                  </motion.div>
                );
              }

              const chReviews = reviews.filter((r) => r.seriesId === id && r.chapterId === c.id);
              const chAvgRating = chReviews.length > 0
                ? (chReviews.reduce((sum, r) => sum + r.rating, 0) / chReviews.length).toFixed(1)
                : null;
              const chComments = comments.filter((cm) => cm.chapterId === c.id);

              return (
                <motion.div
                  key={c.id}
                  className="sf-comic-card flex flex-col gap-3 rounded-2xl border border-white/10 bg-card p-4 md:flex-row md:items-center md:justify-between transition hover:border-white/20"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-1.5">
                    <div className="font-semibold text-white text-base">
                      Chapter {c.number}: {c.title}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                      <span>{new Date(c.releaseDateIso).toLocaleDateString()}</span>
                      <span className="text-white/20">·</span>
                      <Badge tone="primary">Free</Badge>
                      <span className="text-white/20">·</span>
                      {chAvgRating ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                          <Star className="h-3 w-3 fill-amber-400" />
                          {chAvgRating} ({chReviews.length})
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted">★ No ratings yet</span>
                      )}
                      <span className="text-white/20">·</span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                        <MessageSquare className="h-3 w-3" />
                        {chComments.length} {chComments.length === 1 ? "comment" : "comments"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 border-white/15 hover:border-primary/40 text-xs"
                      onClick={() => {
                        setSelectedChapterForFeedback(c);
                        const myReview = chReviews.find((r) => r.userEmail === userEmail);
                        setChRating(myReview ? myReview.rating : 0);
                        setChReviewText(myReview ? myReview.reviewText : "");
                        setChCommentText("");
                      }}
                    >
                      <Star className="h-3.5 w-3.5 text-amber-400" /> Reviews &amp; Comments
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => handleReadChapter(c.id)}>
                      Read Now
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : null}

        {tab === "about" ? (
          <div className="sf-comic-panel sf-comic-surface rounded-3xl border border-white/10 bg-card p-5">
            <div className="font-display text-2xl tracking-widest text-white">About</div>
            <p className="mt-2 text-sm text-white/80">
              {series.description}
            </p>
          </div>
        ) : null}

        {tab === "community" ? (
          <div className="sf-comic-panel sf-comic-surface rounded-3xl border border-white/10 bg-card p-5">
            <div className="font-display text-2xl tracking-widest text-white">Community Reactions</div>
            <p className="mt-2 text-sm text-white/80">
              Readers’ emoji drops appear here (fed by <code className="rounded bg-black/30 px-1.5 py-0.5 text-primary">/api/interactions/react</code>).
            </p>
          </div>
        ) : null}
        {/* Amazon-style Rating & Reviews Section */}
        <div className="sf-comic-panel sf-comic-surface rounded-3xl border border-white/10 bg-card p-5 md:p-6 space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h2 className="font-display text-2xl tracking-widest text-white">Customer Reviews &amp; Ratings</h2>
          </div>

          {isSaved ? (
            <div className="grid gap-8 md:grid-cols-[280px_1fr]">
              {/* Left Column: Breakdown */}
              <div className="space-y-5">
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-white">{averageRating}</span>
                    <span className="text-sm text-muted">out of 5</span>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={cn(
                          "text-xl",
                          star <= Math.round(Number(averageRating)) ? "text-amber-400" : "text-muted/25"
                        )}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-muted">
                    {seriesReviews.length} total customer {seriesReviews.length === 1 ? 'rating' : 'ratings'}
                  </div>
                </div>

                {/* Breakdown Chart */}
                <div className="space-y-2">
                  {([5, 4, 3, 2, 1] as const).map((stars) => {
                    const pct = breakdown[stars];
                    return (
                      <div key={stars} className="flex items-center gap-2 text-xs text-white/85">
                        <span className="w-8 shrink-0 hover:underline cursor-pointer">{stars} star</span>
                        <div className="h-4 flex-1 rounded bg-black/40 overflow-hidden border border-white/5">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-8 text-right shrink-0">{pct}%</span>
                      </div>
                    );
                  })}
                </div>

                {/* Write Review Form */}
                <div className="border-t border-white/10 pt-5 space-y-3">
                  <div className="text-sm font-semibold text-white">
                    {existingReview ? "Edit your review" : "Review this comic"}
                  </div>
                  {isAuthenticated ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted">Rating:</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setUserRating(star)}
                              onMouseEnter={() => setUserHoverRating(star)}
                              onMouseLeave={() => setUserHoverRating(0)}
                              className="text-lg transition cursor-pointer"
                              aria-label={`Rate ${star} stars`}
                            >
                              <span
                                className={cn(
                                  star <= (userHoverRating || userRating)
                                    ? "text-amber-400 font-bold"
                                    : "text-muted/40"
                                )}
                              >
                                ★
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <textarea
                          value={userReviewText}
                          onChange={(e) => setUserReviewText(e.target.value)}
                          placeholder="What did you like or dislike? Write a review..."
                          className="min-h-20 w-full resize-none rounded-xl border border-white/10 bg-black/25 p-3 text-xs text-white outline-none placeholder:text-muted focus:border-primary/45"
                        />
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full"
                          onClick={submitSeriesReview}
                        >
                          {existingReview ? "Update Review" : "Submit Review"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted leading-relaxed">
                      You must be{" "}
                      <Link href={`/login?redirectTo=/series/${id}`} className="text-white underline font-semibold">
                        logged in
                      </Link>{" "}
                      to leave a customer rating and review.
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column: Reviews List */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Customer Reviews</h3>
                {seriesReviews.length > 0 ? (
                  <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2 divide-y divide-white/5">
                    {seriesReviews.map((rev) => {
                      const isOwnReview = rev.userEmail === userEmail;
                      return (
                        <div key={rev.id} className={cn("pt-3 first:pt-0 space-y-2", isOwnReview && "pb-2 bg-white/5 px-3 py-2 rounded-xl border border-white/5")}>
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-primary to-highlight text-white text-[11px] font-bold flex items-center justify-center shadow">
                                {rev.userName.slice(0, 2).toUpperCase()}
                              </div>
                              <div className="text-xs">
                                <span className="font-semibold text-white">{rev.userName}</span>
                                {isOwnReview && (
                                  <span className="ml-2 inline-block px-1.5 py-0.5 rounded bg-primary/20 text-primary text-[9px] font-bold">
                                    Your Review
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="text-[10px] text-muted">{new Date(rev.atIso).toLocaleDateString()}</span>
                          </div>
                          
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={cn(
                                  "text-sm",
                                  star <= rev.rating ? "text-amber-400" : "text-muted/25"
                                )}
                              >
                                ★
                              </span>
                            ))}
                          </div>

                          {rev.reviewText && (
                            <p className="text-xs text-white/80 leading-relaxed pl-1">
                              {rev.reviewText}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10 rounded-2xl border border-dashed border-white/10 bg-black/10">
                    <p className="text-sm text-muted font-display">No customer reviews yet. Be the first to review this comic!</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 rounded-3xl border-2 border-dashed border-white/10 bg-black/15 max-w-xl mx-auto space-y-4 px-6 my-2">
              <div className="text-3xl select-none">🔒</div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white font-display">Customer Reviews are Gated</h3>
                <p className="text-xs text-muted leading-relaxed">
                  Please save this comic series to your library/playlist to read reviews, view ratings, and share your feedback.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleToggleSave}
                className="gap-1.5 font-bold shadow-lg shadow-primary/25 rounded-full"
              >
                <Bookmark className="h-4 w-4" /> Save to Playlist &amp; Unlock
              </Button>
            </div>
          )}
        </div>

        <div className="sf-comic-panel sf-comic-surface rounded-3xl border border-white/10 bg-card p-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 font-display text-2xl tracking-widest text-white">
              <MessageSquare className="h-5 w-5 text-primary" />
              Comic comments
            </div>
            <div className="text-xs text-muted">Sent to writer and admin inboxes</div>
          </div>
          <div className="mt-4 flex flex-col gap-2 md:flex-row">
            <textarea
              value={comicCommentText}
              onChange={(event) => setComicCommentText(event.target.value)}
              className="min-h-20 flex-1 resize-none rounded-2xl border border-white/10 bg-black/25 p-3 text-sm outline-none placeholder:text-muted focus:border-primary/45"
              placeholder="Share feedback about this comic..."
            />
            <Button
              variant="primary"
              className="gap-2 self-stretch md:self-auto"
              onClick={submitComicComment}
              disabled={!comicCommentText.trim()}
            >
              <Send className="h-4 w-4" /> Send
            </Button>
          </div>
          {comicComments.length > 0 ? (
            <div className="mt-4 space-y-2">
              {comicComments.slice(0, 4).map((comment) => (
                <div key={comment.id} className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2 text-sm">
                  <div className="flex items-center justify-between gap-2 text-xs text-muted">
                    <span>{comment.readerName}</span>
                    <span>{new Date(comment.atIso).toLocaleString()}</span>
                  </div>
                  <div className="mt-1 text-white/80">{comment.body}</div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </motion.main>

      {/* Chapter Feedback (Rating & Comments) Modal */}
      <AnimatePresence>
        {selectedChapterForFeedback && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl border border-white/15 bg-card p-6 shadow-2xl text-white space-y-5"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-primary">
                    Chapter Feedback &amp; Community
                  </div>
                  <h3 className="text-xl font-display font-bold text-white mt-1">
                    Chapter {selectedChapterForFeedback.number}: {selectedChapterForFeedback.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedChapterForFeedback(null)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-muted hover:text-white transition"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center justify-between gap-3 bg-white/5 p-3 rounded-2xl border border-white/10">
                <div className="text-xs text-muted">
                  Ready to read this chapter?
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    const chId = selectedChapterForFeedback.id;
                    setSelectedChapterForFeedback(null);
                    handleReadChapter(chId);
                  }}
                >
                  Read Chapter Now
                </Button>
              </div>

              {/* Rate & Review This Chapter Section */}
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">Rate &amp; Review Chapter {selectedChapterForFeedback.number}</span>
                  <span className="text-xs text-amber-400 font-bold">
                    {chRating > 0 ? `★ ${chRating} / 5` : "Select rating"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 justify-center py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setChRating(star)}
                      onMouseEnter={() => setChHoverRating(star)}
                      onMouseLeave={() => setChHoverRating(0)}
                      className="text-2xl transition cursor-pointer"
                      aria-label={`Rate ${star} stars`}
                    >
                      <span className={cn(star <= (chHoverRating || chRating) ? "text-amber-400 font-bold" : "text-muted/40")}>
                        ★
                      </span>
                    </button>
                  ))}
                </div>
                <textarea
                  value={chReviewText}
                  onChange={(e) => setChReviewText(e.target.value)}
                  placeholder={`What did you think of Chapter ${selectedChapterForFeedback.number}?`}
                  className="w-full h-18 resize-none rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white outline-none focus:border-primary/50 placeholder:text-muted"
                />
                <Button variant="primary" size="sm" onClick={submitChapterFeedback} className="w-full">
                  Submit Chapter Review
                </Button>
              </div>

              {/* Chapter Reviews List */}
              <div className="space-y-2.5">
                <div className="text-xs font-bold uppercase tracking-wider text-muted">
                  Chapter Reviews ({reviews.filter((r) => r.seriesId === id && r.chapterId === selectedChapterForFeedback.id).length})
                </div>
                {reviews.filter((r) => r.seriesId === id && r.chapterId === selectedChapterForFeedback.id).length === 0 ? (
                  <p className="text-xs text-muted/60 italic py-1">No reviews for this chapter yet. Be the first!</p>
                ) : (
                  reviews
                    .filter((r) => r.seriesId === id && r.chapterId === selectedChapterForFeedback.id)
                    .map((r) => (
                      <div key={r.id} className="rounded-xl border border-white/5 bg-white/5 p-3 space-y-1 text-xs">
                        <div className="flex items-center justify-between text-muted">
                          <span className="font-semibold text-white">{r.userName}</span>
                          <span className="text-amber-400 font-bold">★ {r.rating}</span>
                        </div>
                        <p className="text-white/80">{r.reviewText}</p>
                      </div>
                    ))
                )}
              </div>

              {/* Chapter Comments Section */}
              <div className="space-y-3 border-t border-white/10 pt-4">
                <div className="text-xs font-bold uppercase tracking-wider text-muted">
                  Chapter Comments ({comments.filter((cm) => cm.chapterId === selectedChapterForFeedback.id).length})
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chCommentText}
                    onChange={(e) => setChCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submitChapterModalComment()}
                    placeholder="Leave a comment on this chapter..."
                    className="flex-1 h-9 px-3 rounded-xl border border-white/10 bg-black/30 text-xs text-white outline-none focus:border-primary/45 placeholder:text-muted"
                  />
                  <Button variant="outline" size="sm" onClick={submitChapterModalComment} disabled={!chCommentText.trim()}>
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {comments.filter((cm) => cm.chapterId === selectedChapterForFeedback.id).length === 0 ? (
                  <p className="text-xs text-muted/60 italic py-1">No comments on this chapter yet.</p>
                ) : (
                  comments
                    .filter((cm) => cm.chapterId === selectedChapterForFeedback.id)
                    .map((cm) => (
                      <div key={cm.id} className="rounded-xl border border-white/5 bg-white/5 p-2.5 text-xs space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-muted">
                          <span className="font-bold text-white/90">{cm.readerName}</span>
                          <span>{new Date(cm.atIso).toLocaleDateString()}</span>
                        </div>
                        <p className="text-white/80">{cm.body}</p>
                      </div>
                    ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {series && (
        <SaveToPlaylistModal
          open={playlistOpen}
          series={series}
          onClose={() => setPlaylistOpen(false)}
        />
      )}
    </div>
  );
}
