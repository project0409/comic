"use client";

import Link from "@/compat/next-link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight, Eye, EyeOff, Layers, MessageSquare, Send, Shield, Volume2, VolumeX, WandSparkles, X } from "lucide-react";
import { Button } from "@/components/Button";
import { cn } from "@/components/cn";
import { getChapterPages } from "@/lib/api";
import { chaptersBySeries, seriesList } from "@/lib/mockData";
import type { ChapterPage } from "@/lib/types";
import { audioEngine } from "@/lib/audioEngine";
import { useAudioStore } from "@/store/audioStore";
import { useReaderStore } from "@/store/readerStore";
import { useUiStore } from "@/store/uiStore";
import { useVaultStore } from "@/store/vaultStore";
import { useAuthStore } from "@/store/authStore";
import { useCommentStore } from "@/store/commentStore";
import { CanvasPage } from "./CanvasPage";
import { ReactionPicker } from "./ReactionPicker";
import { LoreMasterOverlay } from "@/features/loremaster/LoreMasterOverlay";

export function ImmersiveReader({ chapterId }: { chapterId: string }) {
  const series = useMemo(() => {
    for (const [sId, chs] of Object.entries(chaptersBySeries)) {
      if (chs.some((c) => c.id === chapterId)) {
        return seriesList.find((s) => s.id === sId) ?? null;
      }
    }
    return seriesList[0] ?? null;
  }, [chapterId]);

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

  const addReaction = useVaultStore((s) => s.addReaction);
  const addBookmark = useVaultStore((s) => s.addBookmark);
  const displayName = useAuthStore((s) => s.displayName);
  const addComment = useCommentStore((s) => s.addComment);
  const comments = useCommentStore((s) => s.comments);
  const chapterComments = useMemo(
    () => comments.filter((comment) => comment.targetType === "Chapter" && comment.chapterId === chapterId),
    [chapterId, comments]
  );

  const [pages, setPages] = useState<ChapterPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");

  // Long-press reactions
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pressPoint, setPressPoint] = useState({ x: 0, y: 0 });
  const pressTimerRef = useRef<number | null>(null);
  const canvasRectRef = useRef<DOMRect | null>(null);

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

  function onPointerDown(e: React.PointerEvent) {
    if ((e.pointerType === "mouse" && e.button !== 0) || loreMasterOpen) return;
    if (pressTimerRef.current) window.clearTimeout(pressTimerRef.current);

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    canvasRectRef.current = rect;
    const clientX = e.clientX;
    const clientY = e.clientY;

    pressTimerRef.current = window.setTimeout(() => {
      setPressPoint({ x: clientX, y: clientY });
      setPickerOpen(true);
      // Haptic simulation
      document.body.classList.remove("sf-vibrate");
      void document.body.offsetWidth;
      document.body.classList.add("sf-vibrate");
    }, 500);

    // Prevent native drag/select
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  }

  function onPointerUp() {
    if (pressTimerRef.current) {
      window.clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  }

  async function handlePickReaction(payload: { emoji: any; comment?: string; bookmark?: boolean }) {
    setPickerOpen(false);
    if (!page) return;
    const rect = canvasRectRef.current;
    if (!rect) return;

    const xCoord = Math.max(0, Math.min(rect.width, pressPoint.x - rect.left));
    const yCoord = Math.max(0, Math.min(rect.height, pressPoint.y - rect.top));

    addReaction({
      emoji: payload.emoji,
      seriesName: series?.title ?? "FYP Series",
      chapterId,
      pageIndex: page.index,
      x: xCoord,
      y: yCoord,
      comment: payload.comment
    });

    if (payload.bookmark) {
      addBookmark({
        seriesName: series?.title ?? "FYP Series",
        chapterId,
        pageIndex: page.index,
        x: xCoord,
        y: yCoord,
        note: payload.comment,
        thumbUrl: series?.coverUrl ?? "/placeholders/panel-2.svg"
      });
    }

    await fetch("/api/interactions/react", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emoji: payload.emoji,
        x_coord: xCoord,
        y_coord: yCoord,
        page_id: page.id,
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
    <div className="relative min-h-dvh bg-bg" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {/* Top bar */}
      <AnimatePresence>
        {!distractionFreeMode ? (
          <motion.div
            initial={{ y: -14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            className="sticky top-0 z-40 border-b border-white/10 bg-bg/85 backdrop-blur-xl"
          >
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
              {/* Single dedicated "Exit Chapter" button pointing back to Comic Details */}
              <div className="min-w-0 flex items-center gap-3">
                <Link
                  href={series ? `/series/${series.id}#chapters` : "/discover"}
                  className="group flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white hover:border-primary/50 hover:bg-white/10 transition shadow-sm"
                  title="Exit Chapter: Back to Comic Chapters"
                >
                  <ArrowLeft className="h-4 w-4 text-primary transition group-hover:-translate-x-0.5" />
                  <span className="font-semibold text-white">Exit Chapter</span>
                </Link>

                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">
                    {series ? series.title : `Chapter ${chapterId}`} · Page {currentPage} / {totalPages}
                  </div>
                  <div className="text-xs text-muted truncate">
                    Chapter {chapterId} · Immersive Reader
                  </div>
                </div>
              </div>

              {/* Reader Controls */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={toggleReadingMode} title="Toggle reading mode">
                  {readingMode === "flip" ? "3D Flip" : "Scroll"}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setGuidedViewActive(!guidedViewActive)}
                  title="Guided view (panel zoom)"
                >
                  {guidedViewActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>

                <Button variant="outline" size="sm" onClick={toggleMuted} title="Mute">
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>

                <Button variant="outline" size="sm" onClick={() => setLoreMasterOpen(true)} title="Lore Master AI">
                  <WandSparkles className="h-4 w-4" />
                </Button>

                <Link href={series ? `/series/${series.id}` : "/discover"}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 text-muted hover:text-white border border-white/10"
                    title="Close Reader"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Reader canvas area */}
      <div className="mx-auto max-w-6xl px-3 py-4">
        <div className="sf-comic-panel rounded-3xl border border-white/10 bg-surface/90 p-3 md:p-4">
          <div className="flex items-center justify-between gap-3 pb-3">
            <div className="flex items-center gap-2 text-xs text-muted">
              <Shield className="h-4 w-4" />
              Canvas render · Right-click disabled · No direct &lt;img&gt; tags
            </div>

            {!distractionFreeMode ? (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={prev} disabled={currentPage <= 1}>
                  <ChevronLeft className="h-4 w-4" /> Prev
                </Button>
                <Button variant="ghost" size="sm" onClick={next} disabled={currentPage >= totalPages}>
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            ) : null}
          </div>

          <div
            className={cn(
              "relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 shadow-[inset_0_0_42px_rgba(0,0,0,0.32)]",
              "h-[70vh] md:h-[74vh]"
            )}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {loading ? <LoadingOverlay /> : null}

            {guidedViewActive ? (
              <GuidedViewReader chapterId={chapterId} pages={pages} />
            ) : readingMode === "scroll" ? (
              <ScrollReader pages={pages} />
            ) : (
              <FlipReader pages={pages} />
            )}
          </div>

          {/* End of Chapter completion box */}
          {currentPage >= totalPages ? (
            <div className="mt-4 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-purple-500/10 to-[#22c55e]/10 p-5 text-center space-y-3">
              <div className="font-bold text-white text-base">You finished Chapter {chapterId}!</div>
              <p className="text-xs text-muted">Continue your journey with other chapters or explore more comics.</p>
              <div className="flex flex-wrap justify-center gap-2 pt-1">
                <Link href={series ? `/series/${series.id}#chapters` : "/series"}>
                  <Button variant="outline" size="sm" className="gap-1.5 border-primary/40 text-primary">
                    <Layers className="h-3.5 w-3.5" /> Back to Chapter List
                  </Button>
                </Link>
                <Link href="/discover">
                  <Button variant="primary" size="sm" className="gap-1.5">
                    Explore Other Comics
                  </Button>
                </Link>
              </div>
            </div>
          ) : null}

          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <MessageSquare className="h-4 w-4 text-primary" />
                Chapter comments
              </div>
              <div className="text-xs text-muted">Sent to writer and admin inboxes</div>
            </div>
            <div className="mt-3 flex flex-col gap-2 md:flex-row">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="min-h-20 flex-1 resize-none rounded-2xl border border-white/10 bg-black/25 p-3 text-sm outline-none placeholder:text-muted focus:border-primary/45"
                placeholder="Share feedback about this chapter..."
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

      {/* Bottom progress bar */}
      <AnimatePresence>
        {!distractionFreeMode ? (
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

      {/* Persistent mute + volume panel pinned bottom-left (always visible) */}
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

function ScrollReader({ pages }: { pages: ChapterPage[] }) {
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
        {pages.map((p) => (
          <motion.div
            key={p.id}
            data-page={p.index}
            initial={{ opacity: 0.85, rotateX: 6, y: 15 }}
            whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.4 }}
            className="sf-comic-card rounded-2xl border border-white/10 bg-black/35 p-2 shadow-2xl transition-transform"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="mb-2 flex items-center justify-between px-2 text-xs text-muted">
              <span className="font-semibold text-white/80">Page {p.index}</span>
              {p.mood ? <span className="text-[10px] text-primary">{p.mood}</span> : null}
            </div>
            <div className="h-[70vh] overflow-hidden rounded-xl">
              <CanvasPage src={p.imageUrl} />
            </div>
          </motion.div>
        ))}
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
