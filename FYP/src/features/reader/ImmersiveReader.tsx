"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Eye, EyeOff, Lock, Shield, Volume2, VolumeX, WandSparkles } from "lucide-react";
import { Button } from "@/components/Button";
import { cn } from "@/components/cn";
import { getChapterPages } from "@/lib/api";
import type { ChapterPage } from "@/lib/types";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { audioEngine } from "@/lib/audioEngine";
import { useAudioStore } from "@/store/audioStore";
import { useReaderStore } from "@/store/readerStore";
import { useUiStore } from "@/store/uiStore";
import { useVaultStore } from "@/store/vaultStore";
import { CanvasPage } from "./CanvasPage";
import { ReactionPicker } from "./ReactionPicker";
import { LoreMasterOverlay } from "@/features/loremaster/LoreMasterOverlay";

export function ImmersiveReader({ chapterId }: { chapterId: string }) {
  const isMobile = useMediaQuery("(max-width: 767px)");

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

  const [pages, setPages] = useState<ChapterPage[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Guided view auto-enable on mobile
  useEffect(() => {
    setGuidedViewActive(isMobile);
  }, [isMobile, setGuidedViewActive]);

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

    // Capture exact x/y pixel coords relative to reader canvas area.
    const xCoord = Math.max(0, Math.min(rect.width, pressPoint.x - rect.left));
    const yCoord = Math.max(0, Math.min(rect.height, pressPoint.y - rect.top));

    addReaction({
      emoji: payload.emoji,
      seriesName: "FYP Series",
      chapterId,
      pageIndex: page.index,
      x: xCoord,
      y: yCoord,
      comment: payload.comment
    });

    if (payload.bookmark) {
      addBookmark({
        seriesName: "FYP Series",
        chapterId,
        pageIndex: page.index,
        x: xCoord,
        y: yCoord,
        note: payload.comment,
        thumbUrl: "/placeholders/panel-2.svg"
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

  return (
    <div className="relative min-h-dvh bg-bg" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {/* Top bar */}
      <AnimatePresence>
        {!distractionFreeMode ? (
          <motion.div
            initial={{ y: -14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            className="sticky top-0 z-40 border-b border-white/8 bg-bg/70 backdrop-blur-xl"
          >
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">
                  Chapter {chapterId} · Page {currentPage} / {totalPages}
                </div>
                <div className="text-xs text-muted">Immersive Reader</div>
              </div>

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

                <Link href="/vault">
                  <Button variant="outline" size="sm" title="Vault">
                    <Lock className="h-4 w-4" />
                  </Button>
                </Link>

                <Link href="/">
                  <Button variant="ghost" size="sm" title="Exit">
                    Exit
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

            {guidedViewActive && isMobile ? (
              <GuidedViewReader chapterId={chapterId} pages={pages} />
            ) : readingMode === "scroll" ? (
              <ScrollReader pages={pages} />
            ) : (
              <FlipReader pages={pages} />
            )}
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
    setDir(delta);
    setCurrentPage(Math.max(1, Math.min(totalPages, currentPage + delta)));
  }

  return (
    <div className="relative h-full w-full [perspective:1400px]">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={page?.id ?? "empty"}
          className="absolute inset-0"
          initial={{ rotateY: dir === 1 ? 55 : -55, opacity: 0.5 }}
          animate={{ rotateY: 0, opacity: 1 }}
          exit={{ rotateY: dir === 1 ? -55 : 55, opacity: 0.5 }}
          transition={{ type: "spring", stiffness: 240, damping: 26 }}
          style={{ transformStyle: "preserve-3d" }}
          onClick={(e) => {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            const x = e.clientX - rect.left;
            if (x < rect.width * 0.25) go(-1);
            else if (x > rect.width * 0.75) go(1);
          }}
        >
          {page ? <CanvasPage src={page.imageUrl} /> : null}
        </motion.div>
      </AnimatePresence>
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
    <div ref={containerRef} className="h-full w-full overflow-y-auto p-3">
      <div className="mx-auto max-w-[860px] space-y-6">
        {pages.map((p) => (
          <div
            key={p.id}
            data-page={p.index}
            className="sf-comic-card rounded-2xl border border-white/10 bg-black/25 p-2"
          >
            <div className="mb-2 text-xs text-muted">Page {p.index}</div>
            <div className="h-[70vh] overflow-hidden rounded-xl">
              <CanvasPage src={p.imageUrl} />
            </div>
          </div>
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

  // ML-like panel zoom: we apply a "camera" transform to the page wrapper.
  const transform = useMemo(() => {
    if (!active) return { x: 0, y: 0, scale: 1 };
    // Active coords are in normalized 0..1 in mock data.
    const cx = active.x + active.w / 2;
    const cy = active.y + active.h / 2;
    const scale = Math.min(3.2, Math.max(1.6, 1 / Math.max(active.w, active.h)));
    return { x: (0.5 - cx) * 520 * scale, y: (0.5 - cy) * 720 * scale, scale };
  }, [active]);

  function nextPanel() {
    if (!page) return;
    if (panelIdx < panels.length - 1) {
      setPanelIdx(panelIdx + 1);
      return;
    }
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      return;
    }
  }

  function prevPanel() {
    if (!page) return;
    if (panelIdx > 0) {
      setPanelIdx(panelIdx - 1);
      return;
    }
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      return;
    }
  }

  return (
    <div className="relative h-full w-full">
      <motion.div
        className="absolute inset-0"
        animate={transform}
        transition={{ type: "spring", stiffness: 180, damping: 26 }}
        style={{ transformOrigin: "center" }}
      >
        {page ? <CanvasPage src={page.imageUrl} /> : null}
      </motion.div>

      <div className="absolute left-3 top-3 rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-xs text-muted backdrop-blur-xl">
        Guided View · panel {panels.length ? panelIdx + 1 : 0}/{panels.length} · page {currentPage}/{totalPages}
      </div>

      <button
        className="absolute left-0 top-0 h-full w-[30%]"
        aria-label="Previous panel"
        onClick={prevPanel}
      />
      <button className="absolute right-0 top-0 h-full w-[30%]" aria-label="Next panel" onClick={nextPanel} />
    </div>
  );
}
