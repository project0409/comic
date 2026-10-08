"use client";

import Link from "@/compat/next-link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Bookmark, ChevronLeft, ChevronRight, Eye, EyeOff, Layers, MessageSquare, Send, Shield, Smile, Volume2, VolumeX, WandSparkles, X } from "lucide-react";
import { Button } from "@/components/Button";
import { cn } from "@/components/cn";
import { getChapterPages } from "@/lib/api";
import { chaptersBySeries, seriesList } from "@/lib/mockData";
import type { ChapterPage } from "@/lib/types";
import { audioEngine } from "@/lib/audioEngine";
import { useAudioStore } from "@/store/audioStore";
import { useReaderStore } from "@/store/readerStore";
import { useUiStore } from "@/store/uiStore";
import { useVaultStore, type VaultReaction } from "@/store/vaultStore";
import { useAuthStore } from "@/store/authStore";
import { useCommentStore } from "@/store/commentStore";
import { useReviewStore } from "@/store/reviewStore";
import { useToastStore } from "@/store/toastStore";
import { CanvasPage } from "./CanvasPage";
import { ComicReader } from "./components/ComicReader";
import { ChapterSelector } from "./components/ChapterSelector";
import { COMIC_CHAPTERS } from "@/lib/comicChapters";
import { ReactionPicker } from "./ReactionPicker";
import { LoreMasterOverlay } from "@/features/loremaster/LoreMasterOverlay";
import { useRouter, useSearchParams } from "@/compat/next-navigation";
import { SaveToPlaylistModal } from "@/components/SaveToPlaylistModal";
import { canGuestRead, getChapterInfo } from "@/lib/guestReaderLimit";

export function ImmersiveReader({ chapterId }: { chapterId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromParam = searchParams?.get("from");

  const series = useMemo(() => {
    for (const [sId, chs] of Object.entries(chaptersBySeries)) {
      if (chs.some((c) => c.id === chapterId)) {
        return seriesList.find((s) => s.id === sId) ?? null;
      }
    }
    return seriesList[0] ?? null;
  }, [chapterId]);

  const seriesChapters = useMemo(() => {
    if (!series) return [];
    return chaptersBySeries[series.id] ?? [];
  }, [series]);

  const currentChapterIndex = useMemo(() => {
    return seriesChapters.findIndex((c) => c.id === chapterId);
  }, [seriesChapters, chapterId]);

  const currentChapter = seriesChapters[currentChapterIndex];
  const nextChapter = currentChapterIndex >= 0 && currentChapterIndex < seriesChapters.length - 1
    ? seriesChapters[currentChapterIndex + 1]
    : null;

  const readingMode = useReaderStore((s) => s.readingMode);
  const toggleReadingMode = useReaderStore((s) => s.toggleReadingMode);
  const guidedViewActive = useReaderStore((s) => s.guidedViewActive);
  const setGuidedViewActive = useReaderStore((s) => s.setGuidedViewActive);
  const currentPage = useReaderStore((s) => s.currentPage);
  const setCurrentPage = useReaderStore((s) => s.setCurrentPage);
  const totalPages = useReaderStore((s) => s.totalPages);
  const setTotalPages = useReaderStore((s) => s.setTotalPages);

  const setAmbient = useUiStore((s) => s.setAmbientColor);
  const loreMasterOpen = useUiStore((s) => s.loreMasterOpen);
  const setLoreMasterOpen = useUiStore((s) => s.setLoreMasterOpen);
  const distractionFreeMode = useUiStore((s) => s.distractionFreeMode);
  const toggleDistractionFree = useUiStore((s) => s.toggleDistractionFree);

  const isMuted = useAudioStore((s) => s.isMuted);
  const toggleMuted = useAudioStore((s) => s.toggleMuted);
  const volume = useAudioStore((s) => s.volume);
  const setVolume = useAudioStore((s) => s.setVolume);

  const reactions = useVaultStore((s) => s.reactions);
  const addReaction = useVaultStore((s) => s.addReaction);
  const addBookmark = useVaultStore((s) => s.addBookmark);
  const bookmarks = useVaultStore((s) => s.bookmarks);
  const addHistory = useVaultStore((s) => s.addHistory);
  const displayName = useAuthStore((s) => s.displayName);
  const userEmail = useAuthStore((s) => s.email);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const toast = useToastStore((s) => s.push);
  const addComment = useCommentStore((s) => s.addComment);
  const comments = useCommentStore((s) => s.comments);
  const chapterComments = useMemo(
    () => comments.filter((comment) => comment.targetType === "Chapter" && comment.chapterId === chapterId),
    [chapterId, comments]
  );

  const reviews = useReviewStore((s) => s.reviews);
  const addOrUpdateReview = useReviewStore((s) => s.addOrUpdateReview);
  
  const chapterReviews = useMemo(() => {
    if (!series) return [];
    return reviews.filter((r) => r.seriesId === series.id && r.chapterId === chapterId);
  }, [reviews, series, chapterId]);

  const existingReview = useMemo(() => {
    if (!series || !userEmail) return null;
    return reviews.find((r) => r.seriesId === series.id && r.chapterId === chapterId && r.userEmail === userEmail) ?? null;
  }, [reviews, series, chapterId, userEmail]);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [playlistOpen, setPlaylistOpen] = useState(false);

  const exitUrl = useMemo(() => {
    if (fromParam === "/library") return "/library";
    if (fromParam === "/vault") return "/vault";
    if (fromParam === "/saved-stories") return "/saved-stories";
    if (fromParam === "/" || fromParam === "home") return "/";
    if (series) return `/series/${series.id}${fromParam ? `?from=${encodeURIComponent(fromParam)}` : "?from=/"}`;
    return "/";
  }, [fromParam, series]);

  const isSaved = useMemo(() => {
    if (!series) return false;
    return bookmarks.some((b) => b.seriesName === series.title);
  }, [bookmarks, series]);

  useEffect(() => {
    if (series && addHistory) {
      addHistory(series.id, chapterId);
    }
  }, [series, chapterId, addHistory]);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setReviewText(existingReview.reviewText);
    } else {
      setRating(0);
      setReviewText("");
    }
  }, [existingReview]);

  function handleSubmitReview() {
    if (!series) return;
    if (rating === 0) {
      toast({
        tone: "danger",
        title: "Rating required",
        message: "Please select a star rating between 1 and 5."
      });
      return;
    }
    addOrUpdateReview({
      seriesId: series.id,
      chapterId,
      userEmail: userEmail!,
      userName: displayName || userEmail!.split("@")[0] || "Reader",
      rating,
      reviewText: reviewText.trim()
    });
    toast({
      tone: "success",
      title: existingReview ? "Review Updated! ⭐" : "Review Submitted! ⭐",
      message: `Thank you for rating Chapter ${currentChapter?.number ?? chapterId}!`
    });
  }

  const [pages, setPages] = useState<ChapterPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");

  // Floating reactions picker state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pressPoint, setPressPoint] = useState({ x: 0, y: 0 });
  const [pickerTarget, setPickerTarget] = useState<{
    pageIndex: number;
    relX: number;
    relY: number;
  }>({ pageIndex: 1, relX: 50, relY: 50 });

  const handleOpenReaction = (
    pageIndex: number,
    clientX: number,
    clientY: number,
    relX = 50,
    relY = 50
  ) => {
    setPickerTarget({ pageIndex, relX, relY });
    setPressPoint({ x: clientX, y: clientY });
    setPickerOpen(true);
  };

  // Distraction-free gesture
  const swipeStartY = useRef<number | null>(null);

  useEffect(() => {
    setLoading(true);
    getChapterPages(chapterId)
      .then((p) => {
        setPages(p);
        setTotalPages(p.length);
        setCurrentPage(1);
        setAmbient(p[0]?.ambientColorHex ?? "#7C3AED");
      })
      .finally(() => setLoading(false));
  }, [chapterId, setAmbient, setCurrentPage, setTotalPages]);

  // Ambient sync + audio sync on page change
  const page = pages[currentPage - 1];
  useEffect(() => {
    if (!page) return;
    setAmbient(page.ambientColorHex);
    audioEngine.setMuted(isMuted);
    audioEngine.setVolume(volume);
    void audioEngine.crossfadeTo(isMuted ? undefined : page.audioUrl ? { url: page.audioUrl, mood: page.mood } : undefined);
  }, [currentPage, isMuted, page, setAmbient, volume]);

  // Keep engine updated on mute/volume toggles even without page change
  useEffect(() => {
    audioEngine.setMuted(isMuted);
  }, [isMuted]);
  useEffect(() => {
    audioEngine.setVolume(volume);
  }, [volume]);

  const completionPct = useMemo(() => {
    if (!totalPages) return 0;
    return Math.round((currentPage / totalPages) * 100);
  }, [currentPage, totalPages]);

  function prev() {
    setCurrentPage(Math.max(1, currentPage - 1));
  }
  function next() {
    setCurrentPage(Math.min(totalPages, currentPage + 1));
  }

  function handleTouchStart(e: React.TouchEvent) {
    swipeStartY.current = e.touches[0]?.clientY ?? null;
  }
  function handleTouchEnd(e: React.TouchEvent) {
    const start = swipeStartY.current;
    const end = e.changedTouches[0]?.clientY ?? null;
    swipeStartY.current = null;
    if (start == null || end == null) return;
    if (end - start > 80) {
      toggleDistractionFree();
    }
  }

  async function handlePickReaction(payload: { emoji: any; comment?: string; bookmark?: boolean }) {
    setPickerOpen(false);
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        message: "Please log in to react to panels and drop emojis.",
        tone: "danger"
      });
      return;
    }

    const targetPage = pickerTarget.pageIndex;
    const relX = pickerTarget.relX;
    const relY = pickerTarget.relY;

    addReaction({
      emoji: payload.emoji,
      seriesName: series?.title ?? "FYP Series",
      chapterId,
      pageIndex: targetPage,
      x: relX,
      y: relY,
      comment: payload.comment
    });

    toast({
      title: `Reaction added! ${payload.emoji}`,
      message: `Pinned to Page ${targetPage}`,
      tone: "success"
    });

    if (payload.bookmark) {
      addBookmark({
        seriesName: series?.title ?? "FYP Series",
        chapterId,
        pageIndex: targetPage,
        x: relX,
        y: relY,
        note: payload.comment,
        thumbUrl: series?.coverUrl ?? "/placeholders/panel-2.svg"
      });
    }

    await fetch("/api/interactions/react", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emoji: payload.emoji,
        x_coord: relX,
        y_coord: relY,
        chapter_id: chapterId,
        page_index: targetPage,
        comment: payload.comment
      })
    }).catch(() => {});
  }

  function submitChapterComment() {
    const body = commentText.trim();
    if (!body) return;
    addComment({
      targetType: "Chapter",
      seriesId: series?.id,
      seriesName: series?.title ?? "FYP Series",
      chapterId,
      pageIndex: currentPage,
      readerName: displayName || "Reader",
      body
    });
    setCommentText("");
  }

  return (
    <div
      className={cn(
        "relative bg-bg transition-colors",
        readingMode === "flip" && !guidedViewActive
          ? "h-screen min-h-screen w-full max-w-full overflow-hidden flex flex-col justify-between"
          : "min-h-dvh"
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top bar */}
      <AnimatePresence>
        {!distractionFreeMode ? (
          <motion.div
            initial={{ y: -14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            className="w-full shrink-0 z-40 border-b border-white/10 bg-[#060812]/95 backdrop-blur-2xl shadow-xl"
          >
            <div className="mx-auto flex flex-nowrap w-full max-w-[1700px] items-center justify-between gap-1.5 sm:gap-3 px-2 sm:px-6 py-2 overflow-x-hidden">
              {/* Desktop App Left: Exit + Divider + Chapter Selector + Comic Title */}
              <div className="min-w-0 flex flex-nowrap items-center gap-1.5 sm:gap-3 shrink-0">
                <button
                  id="tour-reader-exit"
                  type="button"
                  onClick={() => router.replace(exitUrl)}
                  className="group flex items-center justify-center h-8 w-8 sm:h-auto sm:w-auto p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-white/15 bg-white/5 text-xs text-white hover:border-primary/50 hover:bg-white/10 transition shadow-sm cursor-pointer shrink-0"
                  title={
                    fromParam === "/library"
                      ? "Exit Comic: Back to Library"
                      : fromParam === "/vault"
                        ? "Exit Comic: Back to Vault"
                        : fromParam === "/saved-stories"
                          ? "Exit Comic: Back to Saved Stories"
                          : "Exit Comic: Back to Home"
                  }
                >
                  <ArrowLeft className="h-4 w-4 text-primary transition group-hover:-translate-x-0.5" />
                  <span className="font-semibold text-white hidden sm:inline ml-1.5">
                    Exit Comic
                  </span>
                </button>

                <div className="h-5 w-px bg-white/15 hidden sm:block" />

                {/* Chapter Selector Dropdown in Desktop Toolbar */}
                {readingMode === "flip" && (
                  <ChapterSelector
                    currentChapterId={chapterId}
                    chapters={COMIC_CHAPTERS}
                    onSelectChapter={(newChId) => {
                      router.replace(`/read/${newChId}${fromParam ? `?from=${encodeURIComponent(fromParam)}` : ""}`);
                    }}
                  />
                )}

                <div className="min-w-0 hidden md:block">
                  <div className="truncate text-xs font-bold text-white tracking-wide">
                    {series ? series.title : "Cyberpunk Odyssey: Neo-Zenith"}
                  </div>
                  <div className="text-[11px] text-muted truncate">
                    {currentChapter ? `Chapter ${currentChapter.number} — ${currentChapter.title}` : `Chapter ${chapterId}`}
                  </div>
                </div>
              </div>

              {/* Desktop App Right: Mode Toggles, Audio, Lore Master AI, Exit */}
              <div id="tour-reader-controls" className="flex items-center gap-1 sm:gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleReadingMode}
                  className="h-8 px-2 sm:px-2.5 text-xs font-semibold shrink-0"
                  title="Toggle reading mode"
                >
                  <span className="hidden xs:inline">{readingMode === "flip" ? "3D Flip" : "Scroll"}</span>
                  <span className="xs:hidden">{readingMode === "flip" ? "3D" : "Feed"}</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setGuidedViewActive(!guidedViewActive)}
                  title="Guided view (panel zoom)"
                  className="h-8 w-8 p-0 sm:w-auto sm:px-2 text-xs shrink-0"
                >
                  {guidedViewActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>

                {/* Desktop Inline Audio Volume */}
                <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-xl border border-white/10 bg-white/5 h-8">
                  <button
                    type="button"
                    onClick={toggleMuted}
                    className="text-muted hover:text-white transition cursor-pointer"
                    title={isMuted ? "Unmute Audio" : "Mute Audio"}
                  >
                    {isMuted ? <VolumeX className="h-3.5 w-3.5 text-rose-400" /> : <Volume2 className="h-3.5 w-3.5 text-primary" />}
                  </button>
                  <input
                    aria-label="Audio Volume"
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-16 h-1 accent-primary cursor-pointer"
                  />
                </div>

                {/* Mobile / Tablet Audio Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleMuted}
                  title="Ambient Audio"
                  className="h-8 w-8 p-0 sm:w-auto sm:px-2 text-xs lg:hidden shrink-0"
                >
                  {isMuted ? <VolumeX className="h-4 w-4 text-muted" /> : <Volume2 className="h-4 w-4 text-primary" />}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLoreMasterOpen(true)}
                  title="Lore Master AI"
                  className="h-8 w-8 p-0 sm:w-auto sm:px-2 text-xs shrink-0"
                >
                  <WandSparkles className="h-4 w-4 text-highlight" />
                </Button>

                {/* Close button shown on sm: and up (since Left has Exit arrow on mobile) */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.replace(exitUrl)}
                  className="hidden sm:inline-flex h-8 px-2 text-muted hover:text-white border border-white/10 shrink-0"
                  title={
                    fromParam === "/library"
                      ? "Exit to Library"
                      : fromParam === "/vault"
                        ? "Exit to Vault"
                        : fromParam === "/saved-stories"
                          ? "Exit to Saved Stories"
                          : "Close Reader"
                  }
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Reader Area: Desktop Immersive 3D Flip or Scroll View */}
      {readingMode === "flip" && !guidedViewActive ? (
        <div className="w-full flex-1 flex flex-col min-h-0 overflow-hidden">
          <ComicReader
            initialChapterId={chapterId}
            seriesTitle={series?.title}
            onChapterChange={(newChId) => {
              if (!isAuthenticated && !canGuestRead(newChId)) {
                const { chapterNumber } = getChapterInfo(newChId);
                toast({
                  tone: "danger",
                  title: chapterNumber > 2 ? "Chapter Preview Limit" : "Free Preview Limit Reached (2/2)",
                  message: chapterNumber > 2
                    ? `Guest preview is limited to the first 2 chapters. Please log in to read Chapter ${chapterNumber}.`
                    : "You've read your 2 free preview comics! Please log in to continue reading."
                });
                router.push(`/login?redirectTo=/read/${newChId}${fromParam ? `?from=${encodeURIComponent(fromParam)}` : ""}`);
                return;
              }
              router.replace(`/read/${newChId}${fromParam ? `?from=${encodeURIComponent(fromParam)}` : ""}`);
            }}
            onAmbientColorChange={(hex) => setAmbient(hex)}
          />
        </div>
      ) : (
        <div className="mx-auto w-full max-w-[1360px] px-2 sm:px-4 lg:px-6 py-2 sm:py-3">
          <div className="sf-comic-panel rounded-2xl md:rounded-3xl border border-white/10 bg-[#070913]/90 shadow-2xl backdrop-blur-xl p-3 md:p-4">
            <div className="flex items-center justify-between gap-3 pb-3">
              <div className="flex items-center gap-2 text-xs text-muted">
                <Shield className="h-4 w-4" />
                Canvas render · Right-click disabled · No direct &lt;img&gt; tags
              </div>

              {!distractionFreeMode ? (
                <div id="tour-reader-page-nav" className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 h-8 text-xs font-semibold text-white/90 border-white/15 bg-white/5 hover:border-primary/50 hover:bg-primary/10 cursor-pointer"
                    onClick={(e) => {
                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                      handleOpenReaction(currentPage, rect.left + rect.width / 2, rect.top, 50, 50);
                    }}
                    title={`React to Page ${currentPage}`}
                  >
                    <Smile className="h-3.5 w-3.5 text-amber-400" />
                    <span>React</span>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={prev} disabled={currentPage <= 1}>
                    <ChevronLeft className="h-4 w-4" /> Prev
                  </Button>
                  {currentPage >= totalPages && nextChapter && nextChapter.status !== "ComingSoon" ? (
                    <Button
                      variant="primary"
                      size="sm"
                      className="gap-1 bg-gradient-to-r from-primary to-highlight text-white text-xs font-bold"
                      onClick={() => {
                        if (!isAuthenticated && !canGuestRead(nextChapter.id)) {
                          toast({
                            tone: "danger",
                            title: nextChapter.number > 2 ? "Chapter Preview Limit" : "Free Preview Limit Reached (2/2)",
                            message: nextChapter.number > 2
                              ? `Guest preview is limited to the first 2 chapters. Please log in to read Chapter ${nextChapter.number}.`
                              : "You've read your 2 free preview comics! Please log in to continue reading."
                          });
                          router.push(`/login?redirectTo=/read/${nextChapter.id}`);
                          return;
                        }
                        router.push(`/read/${nextChapter.id}${fromParam ? `?from=${encodeURIComponent(fromParam)}` : ""}`);
                      }}
                    >
                      Next Chapter <ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={next} disabled={currentPage >= totalPages}>
                      Next <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ) : null}
            </div>

            <div
              id="tour-reader-canvas"
              className={cn(
                "relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 shadow-[inset_0_0_42px_rgba(0,0,0,0.32)]",
                "h-[70vh] md:h-[74vh]"
              )}
            >
              {loading ? <LoadingOverlay /> : null}

              {guidedViewActive ? (
                <GuidedViewReader chapterId={chapterId} pages={pages} />
              ) : (
                <ScrollReader
                  pages={pages}
                  chapterId={chapterId}
                  seriesTitle={series?.title}
                  reactions={reactions}
                  onOpenReaction={handleOpenReaction}
                />
              )}
            </div>

          {/* End of Chapter completion box */}
          {currentPage >= totalPages ? (
            <div className="mt-4 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-purple-500/10 to-[#22c55e]/10 p-5 text-center space-y-4">
              <div className="space-y-1">
                <div className="font-bold text-white text-lg">
                  You finished Chapter {currentChapter?.number ?? chapterId}!
                </div>
                <p className="text-xs text-muted">
                  {nextChapter && nextChapter.status !== "ComingSoon"
                    ? `Chapter ${nextChapter.number}: ${nextChapter.title} is ready to read.`
                    : "You've read all available chapters for this comic!"}
                </p>
              </div>

              {/* NEXT CHAPTER BUTTON PROMINENTLY DISPLAYED */}
              {nextChapter && nextChapter.status !== "ComingSoon" ? (
                <div className="pt-1">
                  <Button
                    variant="primary"
                    size="md"
                    className="gap-2 font-bold px-7 py-3 text-sm bg-gradient-to-r from-primary to-highlight text-white shadow-[0_0_24px_rgba(255,51,102,0.45)] hover:scale-105 transition-all cursor-pointer"
                    onClick={() => {
                      if (!isAuthenticated && !canGuestRead(nextChapter.id)) {
                        toast({
                          tone: "danger",
                          title: nextChapter.number > 2 ? "Chapter Preview Limit" : "Free Preview Limit Reached (2/2)",
                          message: nextChapter.number > 2
                            ? `Guest preview is limited to the first 2 chapters. Please log in to read Chapter ${nextChapter.number}.`
                            : "You've read your 2 free preview comics! Please log in to continue reading."
                        });
                        router.push(`/login?redirectTo=/read/${nextChapter.id}`);
                        return;
                      }
                      router.push(`/read/${nextChapter.id}${fromParam ? `?from=${encodeURIComponent(fromParam)}` : ""}`);
                    }}
                  >
                    <span>Read Next Chapter: Chapter {nextChapter.number}</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 font-semibold">
                  ✓ You&apos;re all caught up with the latest chapters!
                </div>
              )}

              <div className="flex flex-wrap justify-center gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
                  onClick={() => router.replace(exitUrl)}
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  {fromParam === "/library"
                    ? "Back to Library"
                    : fromParam === "/vault"
                      ? "Back to Vault"
                      : fromParam === "/saved-stories"
                        ? "Back to Saved Stories"
                        : "Back to Comic"}
                </Button>
                {fromParam !== "/library" && fromParam !== "/vault" && fromParam !== "/saved-stories" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 border border-white/10 text-white/90 hover:bg-white/10"
                    onClick={() => router.push("/")}
                  >
                    Back to Home
                  </Button>
                )}
              </div>

              {/* Chapter Review & Rating Form */}
              <div className="mt-4 border-t border-white/10 pt-4 text-left max-w-md mx-auto space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-white">
                    {existingReview ? `Edit review for Chapter ${currentChapter?.number ?? chapterId}` : `Rate & review Chapter ${currentChapter?.number ?? chapterId}`}
                  </div>
                  {isSaved ? (
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-400/10 px-2.5 py-0.5 rounded-full border border-emerald-400/20">
                      ✓ In Library
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (!isAuthenticated) {
                          toast({
                            tone: "danger",
                            title: "Login Required",
                            message: "Please log in to save stories to your library."
                          });
                          router.push(`/login?redirectTo=/read/${chapterId}`);
                          return;
                        }
                        setPlaylistOpen(true);
                      }}
                      className="text-[10px] text-primary hover:underline font-semibold"
                    >
                      + Save to Library
                    </button>
                  )}
                </div>

                {isAuthenticated ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <span className="text-xs text-muted">Your Chapter Rating:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="text-xl transition cursor-pointer"
                            aria-label={`Rate ${star} stars`}
                          >
                            <span
                              className={cn(
                                star <= (hoverRating || rating)
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

                    <div className="flex flex-col gap-2">
                      <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder={`What did you think of Chapter ${currentChapter?.number ?? chapterId}? (optional)`}
                        className="min-h-16 w-full resize-none rounded-xl border border-white/10 bg-black/25 p-2 text-xs text-white outline-none placeholder:text-muted focus:border-primary/45"
                      />
                      <Button
                        variant="primary"
                        size="sm"
                        className="self-end"
                        onClick={handleSubmitReview}
                      >
                        {existingReview ? "Update Chapter Review" : "Submit Chapter Review"}
                      </Button>
                    </div>

                    {/* Chapter Reviews List */}
                    {chapterReviews.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-white/5">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-muted">
                          Recent Reviews for this Chapter ({chapterReviews.length})
                        </div>
                        {chapterReviews.slice(0, 3).map((r) => (
                          <div key={r.id} className="rounded-xl border border-white/5 bg-white/5 p-2.5 text-xs">
                            <div className="flex items-center justify-between text-muted">
                              <span className="font-bold text-white">{r.userName}</span>
                              <span className="text-amber-400 font-bold">★ {r.rating}</span>
                            </div>
                            {r.reviewText ? <p className="mt-1 text-white/80">{r.reviewText}</p> : null}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-muted text-center py-2">
                    Please log in to rate and review this chapter.
                  </div>
                )}
              </div>
            </div>
          ) : null}

          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <MessageSquare className="h-4 w-4 text-primary" />
                Chapter {currentChapter?.number ?? chapterId} Comments
              </div>
              <div className="text-xs text-muted">Sent to writer and admin inboxes</div>
            </div>
            <div className="mt-3 flex flex-col gap-2 md:flex-row">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="min-h-20 flex-1 resize-none rounded-2xl border border-white/10 bg-black/25 p-3 text-sm outline-none placeholder:text-muted focus:border-primary/45"
                placeholder={`Share feedback about Chapter ${currentChapter?.number ?? chapterId}...`}
              />
              <Button
                variant="primary"
                className="gap-2 self-stretch md:self-auto"
                onClick={submitChapterComment}
                disabled={!commentText.trim()}
              >
                <Send className="h-4 w-4" /> Send
              </Button>
            </div>
            {chapterComments.length > 0 ? (
              <div className="mt-3 space-y-2">
                {chapterComments.slice(0, 3).map((comment) => (
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
        </div>
      </div>
    )}

      {/* Bottom progress bar (only in scroll mode; flip mode has docked reader footer) */}
      <AnimatePresence>
        {!distractionFreeMode && readingMode !== "flip" ? (
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-40"
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 14, opacity: 0 }}
          >
            <div className="mx-auto max-w-6xl px-4 pb-3">
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-[linear-gradient(90deg,var(--sf-primary),var(--sf-highlight))] shadow-[0_0_14px_rgba(255,51,102,0.38)] transition-[width] duration-300"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
              <div className="mt-1 text-right text-[11px] text-muted">{completionPct}% complete</div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Persistent mute + volume panel pinned bottom-left (only for scroll mode) */}
      {readingMode !== "flip" && (
        <div className="fixed bottom-4 left-4 z-[55]">
          <div className="rounded-2xl border border-white/10 bg-black/65 p-3 shadow-[0_0_24px_rgba(0,229,255,0.1)] backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <button
                className="sf-clickable grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 hover:border-highlight/35 hover:bg-white/10"
                onClick={toggleMuted}
                aria-label="Toggle mute"
              >
                {isMuted ? <VolumeX className="h-4 w-4 text-muted" /> : <Volume2 className="h-4 w-4 text-white" />}
              </button>
              <input
                aria-label="Volume"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-28"
              />
            </div>
            <div className="mt-1 text-[11px] text-muted">{page?.mood ? `${page.mood} 🎵` : "Ambient audio"}</div>
          </div>
        </div>
      )}

      <ReactionPicker
        open={pickerOpen}
        x={pressPoint.x}
        y={pressPoint.y}
        onPick={handlePickReaction}
        onClose={() => setPickerOpen(false)}
      />

      <LoreMasterOverlay />

      {/* Distraction-free restore hint */}
      <AnimatePresence>
        {distractionFreeMode ? (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="sf-clickable fixed right-4 top-4 z-[55] rounded-2xl border border-white/10 bg-black/60 px-3 py-2 text-xs text-muted backdrop-blur-xl"
            onClick={toggleDistractionFree}
          >
            Tap to restore UI
          </motion.button>
        ) : null}
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

function LoadingOverlay() {
  return (
    <div className="absolute inset-0 z-10 grid place-items-center bg-black/55">
      <div className="rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-muted backdrop-blur-xl">
        Loading pages…
      </div>
    </div>
  );
}

function FlipReader({ pages }: { pages: ChapterPage[] }) {
  const currentPage = useReaderStore((s) => s.currentPage);
  const setCurrentPage = useReaderStore((s) => s.setCurrentPage);
  const totalPages = useReaderStore((s) => s.totalPages);
  const [dir, setDir] = useState<-1 | 1>(1);

  const page = pages[currentPage - 1];

  function go(delta: -1 | 1) {
    if (delta === 1 && currentPage >= totalPages) return;
    if (delta === -1 && currentPage <= 1) return;
    setDir(delta);
    setCurrentPage(Math.max(1, Math.min(totalPages, currentPage + delta)));
  }

  // Keyboard navigation support (ArrowLeft, ArrowRight)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") go(-1);
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") go(1);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, totalPages]);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 80 : -80,
      rotateY: direction > 0 ? 30 : -30,
      opacity: 0.1,
      scale: 0.95
    }),
    center: {
      x: 0,
      rotateY: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -120 : 120,
      rotateY: direction > 0 ? -60 : 60,
      opacity: 0,
      scale: 0.92
    })
  };

  return (
    <div className="relative h-full w-full [perspective:1400px] overflow-hidden select-none">
      <AnimatePresence mode="popLayout" custom={dir} initial={false}>
        <motion.div
          key={page?.id ?? "empty"}
          custom={dir}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 280, damping: 28 },
            rotateY: { type: "spring", stiffness: 260, damping: 26 },
            opacity: { duration: 0.25 },
            scale: { duration: 0.25 }
          }}
          style={{
            transformStyle: "preserve-3d",
            transformOrigin: dir === 1 ? "left center" : "right center"
          }}
          className="absolute inset-0 cursor-grab active:cursor-grabbing flex items-center justify-center"
          onClick={(e) => {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            const x = e.clientX - rect.left;
            if (x < rect.width * 0.3) go(-1);
            else if (x > rect.width * 0.7) go(1);
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            if (info.offset.x < -40) go(1);
            else if (info.offset.x > 40) go(-1);
          }}
        >
          {page ? <CanvasPage src={page.imageUrl} /> : null}
          {/* Subtle page gradient shadow on page turn */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <button
        className="sf-clickable absolute left-3 top-1/2 z-30 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/60 text-white shadow-2xl backdrop-blur-xl transition hover:scale-110 hover:border-primary disabled:cursor-not-allowed disabled:opacity-30"
        aria-label="Previous page"
        onPointerDown={(e) => e.stopPropagation()}
        onPointerUp={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          go(-1);
        }}
        disabled={currentPage <= 1}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        className="sf-clickable absolute right-3 top-1/2 z-30 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/60 text-white shadow-2xl backdrop-blur-xl transition hover:scale-110 hover:border-primary disabled:cursor-not-allowed disabled:opacity-30"
        aria-label="Next page"
        onPointerDown={(e) => e.stopPropagation()}
        onPointerUp={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          go(1);
        }}
        disabled={currentPage >= totalPages}
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Page indicator pill at bottom */}
      <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 z-30 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-xs text-white backdrop-blur-md">
        Page {currentPage} / {totalPages}
      </div>
    </div>
  );
}

function ScrollReader({
  pages,
  chapterId,
  seriesTitle,
  reactions,
  onOpenReaction
}: {
  pages: ChapterPage[];
  chapterId: string;
  seriesTitle?: string;
  reactions: VaultReaction[];
  onOpenReaction: (pageIndex: number, clientX: number, clientY: number, relX: number, relY: number) => void;
}) {
  const setCurrentPage = useReaderStore((s) => s.setCurrentPage);
  const setTotalPages = useReaderStore((s) => s.setTotalPages);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setTotalPages(pages.length || 1);
  }, [pages.length, setTotalPages]);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll("[data-page]")) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const best = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];
        if (best) {
          const idx = Number((best.target as HTMLElement).dataset.page ?? "1");
          setCurrentPage(idx);
        }
      },
      { root, threshold: [0.35, 0.5, 0.7] }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pages.length, setCurrentPage]);

  return (
    <div ref={containerRef} className="h-full w-full overflow-y-auto p-4 [perspective:1200px]">
      <div className="mx-auto max-w-[860px] space-y-8">
        {pages.map((p) => {
          const pageReactions = reactions.filter(
            (r) =>
              r.pageIndex === p.index &&
              (r.chapterId === chapterId || (seriesTitle && r.seriesName === seriesTitle))
          );
          return (
            <motion.div
              key={p.id}
              data-page={p.index}
              initial={{ opacity: 0.85, rotateX: 6, y: 15 }}
              whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.4 }}
              className="sf-comic-card rounded-2xl border border-white/10 bg-black/35 p-2 sm:p-3 shadow-2xl transition-transform"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="mb-2 flex items-center justify-between px-2 text-xs text-muted">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white/90">Page {p.index}</span>
                  {p.mood ? <span className="text-[10px] text-primary">{p.mood}</span> : null}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    onOpenReaction(p.index, rect.left + rect.width / 2, rect.top, 50, 50);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-white/15 bg-white/5 hover:border-primary/50 hover:bg-primary/15 text-white/90 hover:text-white transition text-[11px] font-semibold cursor-pointer shadow-sm select-none"
                  title={`React to Page ${p.index}`}
                >
                  <Smile className="h-3.5 w-3.5 text-amber-400" />
                  <span>React</span>
                  {pageReactions.length > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-primary/25 border border-primary/30 text-primary text-[10px] font-bold">
                      {pageReactions.length}
                    </span>
                  )}
                </button>
              </div>

              <div className="group/scrollpage relative h-[70vh] overflow-hidden rounded-xl cursor-pointer">
                {/* Subtle hover tooltip hint */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none opacity-0 group-hover/scrollpage:opacity-100 transition-opacity">
                  <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-black/85 border border-white/20 text-white/90 shadow-2xl flex items-center gap-1.5 backdrop-blur-md">
                    <Smile className="h-3.5 w-3.5 text-primary" />
                    <span>Click panel to react</span>
                  </span>
                </div>

                <CanvasPage
                  src={p.imageUrl}
                  onPanelClick={(e, coords) => {
                    onOpenReaction(p.index, coords.clientX, coords.clientY, coords.relX, coords.relY);
                  }}
                />

                {/* Render Placed Emoji Reactions on the Panel */}
                {pageReactions.map((r) => (
                  <div
                    key={r.id}
                    style={{ left: `${r.x}%`, top: `${r.y}%` }}
                    className="absolute z-20 -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    title={`Reaction: ${r.emoji}`}
                  >
                    <div className="relative flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-[#080b18]/90 border border-primary/40 shadow-[0_4px_16px_rgba(0,0,0,0.8),0_0_12px_rgba(255,51,102,0.3)] text-lg sm:text-xl transform hover:scale-125 transition-transform animate-in zoom-in duration-200 cursor-pointer select-none">
                      <span>{r.emoji}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function GuidedViewReader({ chapterId, pages }: { chapterId: string; pages: ChapterPage[] }) {
  const currentPage = useReaderStore((s) => s.currentPage);
  const setCurrentPage = useReaderStore((s) => s.setCurrentPage);
  const totalPages = useReaderStore((s) => s.totalPages);
  const [panelIdx, setPanelIdx] = useState(0);

  const page = pages[currentPage - 1];
  const panels = page?.panelCoordinates ?? [];
  const active = panels[Math.min(panelIdx, Math.max(0, panels.length - 1))];

  useEffect(() => {
    setPanelIdx(0);
  }, [page?.id]);

  const transform = useMemo(() => {
    if (!active) return { x: 0, y: 0, scale: 1 };
    const cx = active.x + active.w / 2;
    const cy = active.y + active.h / 2;
    const scale = Math.min(2.8, Math.max(1.3, 1 / Math.max(active.w, active.h)));
    const tx = (0.5 - cx) * 100 * scale;
    const ty = (0.5 - cy) * 100 * scale;
    return { x: tx, y: ty, scale };
  }, [active]);

  function nextPanel() {
    if (panelIdx < panels.length - 1) {
      setPanelIdx(panelIdx + 1);
    } else if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      setPanelIdx(0);
    }
  }

  function prevPanel() {
    if (panelIdx > 0) {
      setPanelIdx(panelIdx - 1);
    } else if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }

  return (
    <div className="relative h-full w-full overflow-hidden" onClick={nextPanel}>
      <motion.div
        className="h-full w-full"
        animate={{
          x: `${transform.x}%`,
          y: `${transform.y}%`,
          scale: transform.scale
        }}
        transition={{ type: "spring", stiffness: 180, damping: 24 }}
      >
        {page ? <CanvasPage src={page.imageUrl} /> : null}
      </motion.div>

      <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-muted">
        <span className="rounded-xl border border-white/10 bg-black/65 px-3 py-1.5 backdrop-blur-md">
          Panel {panelIdx + 1} / {panels.length || 1}
        </span>
        <span className="rounded-xl border border-white/10 bg-black/65 px-3 py-1.5 backdrop-blur-md">
          Tap to advance panel
        </span>
      </div>

      <button
        className="sf-clickable absolute left-3 top-1/2 z-30 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-black/50 text-white backdrop-blur-xl"
        onClick={(e) => {
          e.stopPropagation();
          prevPanel();
        }}
        aria-label="Previous panel"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        className="sf-clickable absolute right-3 top-1/2 z-30 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-black/50 text-white backdrop-blur-xl"
        onClick={(e) => {
          e.stopPropagation();
          nextPanel();
        }}
        aria-label="Next panel"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
