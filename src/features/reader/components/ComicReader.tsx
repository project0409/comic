"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, Smile } from "lucide-react";
import { Button } from "@/components/Button";
import { cn } from "@/components/cn";
import { ChapterSelector } from "./ChapterSelector";
import { PageFlip, type PanelClickCoords } from "./PageFlip";
import { ReaderControls } from "./ReaderControls";
import { ProgressIndicator } from "./ProgressIndicator";
import { ReactionPicker, type Emoji } from "../ReactionPicker";
import { useVaultStore } from "@/store/vaultStore";
import { useToastStore } from "@/store/toastStore";
import { useAuthStore } from "@/store/authStore";
import { canGuestRead, getChapterInfo } from "@/lib/guestReaderLimit";
import {
  COMIC_CHAPTERS,
  getComicChapter,
  getAllComicChapters,
  type ComicChapterItem,
  type ComicPageItem
} from "@/lib/comicChapters";

export interface ComicReaderProps {
  initialChapterId: string;
  seriesTitle?: string;
  onChapterChange?: (chapterId: string) => void;
  className?: string;
  onAmbientColorChange?: (colorHex: string) => void;
  showTopBar?: boolean;
}

export function ComicReader({
  initialChapterId,
  seriesTitle,
  onChapterChange,
  className,
  onAmbientColorChange,
  showTopBar = false
}: ComicReaderProps) {
  const [currentChapterId, setCurrentChapterId] = useState(initialChapterId);
  const [currentPage, setCurrentPage] = useState(1);
  const [spreadMode, setSpreadMode] = useState<"single" | "two-page">("two-page");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTurning, setIsTurning] = useState(false);

  // Responsive spread mode: desktop/laptop defaults to two-page spread, mobile to single
  useEffect(() => {
    if (typeof window !== "undefined") {
      setSpreadMode(window.innerWidth >= 1024 ? "two-page" : "single");
    }
  }, []);

  // Vault and reaction store integration
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const reactions = useVaultStore((s) => s.reactions);
  const addReaction = useVaultStore((s) => s.addReaction);
  const addBookmark = useVaultStore((s) => s.addBookmark);
  const toast = useToastStore((s) => s.push);

  const [pickerState, setPickerState] = useState<{
    open: boolean;
    pageNumber: number;
    x: number;
    y: number;
    relX: number;
    relY: number;
  }>({
    open: false,
    pageNumber: 1,
    x: 0,
    y: 0,
    relX: 50,
    relY: 50
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const turnTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Touch gesture tracking for mobile swipe
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Retrieve active chapter data
  const chapter: ComicChapterItem = getComicChapter(currentChapterId);
  const pages: ComicPageItem[] = chapter.pages || [];
  const totalPages = pages.length;

  // Filter reactions for active chapter
  const currentChapterReactions = reactions.filter((r) => r.chapterId === currentChapterId);

  // Handle ambient color sync when page changes
  useEffect(() => {
    const activePage = pages[currentPage - 1];
    if (activePage?.ambientColorHex && onAmbientColorChange) {
      onAmbientColorChange(activePage.ambientColorHex);
    }
  }, [currentPage, pages, onAmbientColorChange]);

  // Synchronize when initialChapterId prop updates
  useEffect(() => {
    if (initialChapterId && initialChapterId !== currentChapterId) {
      setCurrentChapterId(initialChapterId);
      setCurrentPage(1);
    }
  }, [initialChapterId]);

  // Chapter Switch Handler
  const handleSelectChapter = useCallback(
    (newChapterId: string) => {
      if (newChapterId === currentChapterId) return;
      if (!isAuthenticated && !canGuestRead(newChapterId)) {
        const { chapterNumber } = getChapterInfo(newChapterId);
        toast({
          tone: "danger",
          title: chapterNumber > 2 ? "Chapter Preview Limit" : "Free Preview Limit Reached (2/2)",
          message: chapterNumber > 2
            ? `Guest preview is limited to the first 2 chapters. Please log in to read Chapter ${chapterNumber}.`
            : "You've read your 2 free preview comics! Please log in to continue reading."
        });
        return;
      }
      setCurrentChapterId(newChapterId);
      setCurrentPage(1); // Reset to page 1
      if (onChapterChange) {
        onChapterChange(newChapterId);
      }
    },
    [currentChapterId, onChapterChange, isAuthenticated, toast]
  );

  // Turn page with debounce lock to protect the 3D animation
  const triggerTurn = useCallback(
    (targetPage: number) => {
      if (isTurning) return; // Prevent rapid click animation glitches
      const bounded = Math.min(Math.max(1, targetPage), totalPages);
      if (bounded === currentPage) return;

      setIsTurning(true);
      if (turnTimeoutRef.current) clearTimeout(turnTimeoutRef.current);

      turnTimeoutRef.current = setTimeout(() => {
        setCurrentPage(bounded);
        setIsTurning(false);
      }, 500); // 500ms smooth 3D transition
    },
    [isTurning, currentPage, totalPages]
  );

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      triggerTurn(currentPage + 1);
    }
  }, [currentPage, totalPages, triggerTurn]);

  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      triggerTurn(currentPage - 1);
    }
  }, [currentPage, triggerTurn]);

  const handleFirstPage = useCallback(() => {
    triggerTurn(1);
  }, [triggerTurn]);

  const handleLastPage = useCallback(() => {
    triggerTurn(totalPages);
  }, [totalPages, triggerTurn]);

  // Open reaction picker from panel click
  const handlePanelClick = useCallback(
    (e: React.MouseEvent, pageNumber: number, coords: PanelClickCoords) => {
      setPickerState({
        open: true,
        pageNumber,
        x: coords.clientX,
        y: coords.clientY,
        relX: coords.relX,
        relY: coords.relY
      });
    },
    []
  );

  // Open reaction picker from bottom toolbar button
  const handleOpenReactionFromToolbar = useCallback(() => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    const clientX = containerRect
      ? containerRect.left + containerRect.width / 2
      : typeof window !== "undefined"
      ? window.innerWidth / 2
      : 200;
    const clientY = containerRect
      ? containerRect.top + containerRect.height / 2
      : typeof window !== "undefined"
      ? window.innerHeight / 2
      : 200;

    setPickerState({
      open: true,
      pageNumber: currentPage,
      x: clientX,
      y: clientY,
      relX: 50,
      relY: 50
    });
  }, [currentPage]);

  // Save reaction (pure 1-click emoji reaction)
  const handlePickReaction = useCallback(
    ({ emoji }: { emoji: Emoji }) => {
      if (!isAuthenticated) {
        toast({
          title: "Login Required",
          message: "Please log in to react to panels and drop emojis.",
          tone: "danger"
        });
        setPickerState((prev) => ({ ...prev, open: false }));
        return;
      }

      const seriesName = seriesTitle || chapter.title;
      addReaction({
        emoji,
        seriesName,
        chapterId: currentChapterId,
        pageIndex: pickerState.pageNumber,
        x: pickerState.relX,
        y: pickerState.relY
      });

      toast({
        title: `Reaction added! ${emoji}`,
        message: `Pinned to Page ${pickerState.pageNumber}`,
        tone: "success"
      });

      setPickerState((prev) => ({ ...prev, open: false }));
    },
    [isAuthenticated, seriesTitle, chapter.title, currentChapterId, pickerState, addReaction, toast]
  );

  // Keyboard Controls: ArrowRight, ArrowLeft, Home, End, Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if user is typing in an input or textarea
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      switch (e.key) {
        case "ArrowRight":
        case "PageDown":
          e.preventDefault();
          handleNextPage();
          break;
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          handlePrevPage();
          break;
        case "Home":
          e.preventDefault();
          handleFirstPage();
          break;
        case "End":
          e.preventDefault();
          handleLastPage();
          break;
        case "Escape":
          if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
          }
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNextPage, handlePrevPage, handleFirstPage, handleLastPage]);

  // Touch Swipe Controls for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const firstTouch = e.touches[0];
    if (!firstTouch) return;
    touchStartX.current = firstTouch.clientX;
    touchStartY.current = firstTouch.clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const touch = e.changedTouches[0];
    if (!touch) return;

    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;

    // Only trigger if horizontal swipe is stronger than vertical scroll
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        // Swipe Left -> Next Page
        handleNextPage();
      } else {
        // Swipe Right -> Previous Page
        handlePrevPage();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Fullscreen toggle handler
  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {
        setIsFullscreen(!isFullscreen);
      });
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={cn(
        "relative w-full h-full flex-1 min-h-0 flex flex-col justify-between transition-colors overflow-hidden",
        isFullscreen ? "fixed inset-0 z-50 bg-[#060810] p-3 overflow-hidden" : "",
        className
      )}
    >
      {/* Standalone Top Bar (Only if showTopBar is explicitly enabled) */}
      {showTopBar ? (
        <div className="w-full max-w-[1700px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-white/10 px-4 select-none mb-2 shrink-0">
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <ChapterSelector
              currentChapterId={currentChapterId}
              chapters={COMIC_CHAPTERS}
              onSelectChapter={handleSelectChapter}
            />
            <div className="hidden md:block">
              <h2 className="text-sm font-bold text-white tracking-wide truncate max-w-xs">
                {seriesTitle ? `${seriesTitle} — ` : ""}
                {chapter.title}
              </h2>
              <p className="text-[11px] text-muted truncate">{chapter.subtitle}</p>
            </div>
          </div>
        </div>
      ) : null}

      {/* 3D COMIC READER CANVAS WITH SIDE NAVIGATION PADDLES IN DESKTOP STAGE */}
      <div className="reader-stage relative w-full flex-1 min-h-0 flex items-center justify-center overflow-hidden px-4 sm:px-8 lg:px-12 xl:px-16">
        {/* Floating Left Navigation Arrow Button in Stage Wing */}
        <button
          type="button"
          onClick={handlePrevPage}
          disabled={!canPrev}
          aria-label="Previous page (Arrow Left)"
          title="Previous Page (ArrowLeft)"
          className={cn(
            "hidden md:flex items-center justify-center absolute left-4 lg:left-8 xl:left-12 top-1/2 -translate-y-1/2 z-40 h-12 w-12 lg:h-14 lg:w-14 rounded-full border border-white/20 bg-[#080b18]/90 backdrop-blur-xl shadow-2xl text-white transition-all cursor-pointer group",
            canPrev
              ? "hover:bg-primary hover:border-primary hover:scale-110 hover:shadow-[0_0_28px_rgba(255,51,102,0.6)]"
              : "opacity-20 cursor-not-allowed pointer-events-none"
          )}
        >
          <ChevronLeft className="h-6 w-6 lg:h-7 lg:w-7 transition group-hover:-translate-x-0.5" />
        </button>

        {/* The 3D Page Flip Component */}
        <PageFlip
          pages={pages}
          currentPage={currentPage}
          onPageChange={triggerTurn}
          spreadMode={spreadMode}
          isTurning={isTurning}
          setIsTurning={setIsTurning}
          onTapLeft={handlePrevPage}
          onTapRight={handleNextPage}
          reactions={currentChapterReactions}
          onPanelClick={handlePanelClick}
          className="w-full h-full flex items-center justify-center"
        />

        {/* Floating Right Navigation Arrow Button in Stage Wing */}
        <button
          type="button"
          onClick={handleNextPage}
          disabled={!canNext}
          aria-label="Next page (Arrow Right)"
          title="Next Page (ArrowRight)"
          className={cn(
            "hidden md:flex items-center justify-center absolute right-4 lg:right-8 xl:right-12 top-1/2 -translate-y-1/2 z-40 h-12 w-12 lg:h-14 lg:w-14 rounded-full border border-white/20 bg-[#080b18]/90 backdrop-blur-xl shadow-2xl text-white transition-all cursor-pointer group",
            canNext
              ? "hover:bg-primary hover:border-primary hover:scale-110 hover:shadow-[0_0_28px_rgba(255,51,102,0.6)]"
              : "opacity-20 cursor-not-allowed pointer-events-none"
          )}
        >
          <ChevronRight className="h-6 w-6 lg:h-7 lg:w-7 transition group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* FOOTER: DOCKED PROGRESS, STATUS & CONTROLS */}
      <div className="w-full shrink-0 border-t border-white/10 bg-[#060812]/95 backdrop-blur-2xl shadow-xl px-2.5 sm:px-6 lg:px-8 py-2 select-none z-30">
        {/* MOBILE FOOTER DOCK (SINGLE SLEEK 40px ROW - PREVENTS SQUEEZING / CLIPPING) */}
        <div className="flex md:hidden items-center justify-between gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={!canPrev}
            aria-label="Previous Page"
            className="h-8 px-2.5 text-xs font-semibold shrink-0 gap-1 text-white/90 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Prev</span>
          </Button>

          <div className="flex-1 flex items-center justify-center min-w-0 px-1">
            <ProgressIndicator
              currentPage={currentPage}
              totalPages={totalPages}
              onSeekPage={triggerTurn}
              className="w-full justify-center"
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              variant="primary"
              size="sm"
              onClick={handleNextPage}
              disabled={!canNext}
              aria-label="Next Page"
              className="h-8 px-2.5 text-xs font-semibold gap-1 shadow-md shadow-primary/20 disabled:opacity-30 disabled:hover:bg-primary/50"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenReactionFromToolbar}
              title="React to panel"
              aria-label="React with emoji"
              className="h-8 w-8 p-0 text-white/90 shrink-0"
            >
              <Smile className="h-4 w-4 text-amber-400" />
            </Button>
          </div>
        </div>

        {/* DESKTOP FOOTER DOCK (COMPREHENSIVE EXPANSIVE BAR) */}
        <div className="hidden md:flex items-center justify-between gap-3 w-full max-w-[1700px] mx-auto">
          {/* Left: Keyboard / Touch Tips */}
          <div className="text-[11px] text-muted hidden xl:flex items-center gap-2 shrink-0">
            <span className="font-medium text-white/70">Keys:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 text-[10px] text-white">←</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 text-[10px] text-white">→</kbd>
            <span>Page Turn</span>
            <span className="text-white/20">·</span>
            <span className="text-white/70">Click panels to react</span>
          </div>

          {/* Center: Interactive Scrubber Progress Bar & Counter */}
          <div className="flex-1 max-w-xl w-full px-2">
            <ProgressIndicator
              currentPage={currentPage}
              totalPages={totalPages}
              onSeekPage={triggerTurn}
              className="w-full"
            />
          </div>

          {/* Right: Reader Controls (First, Prev, Next, Last, Spread, React, Fullscreen) */}
          <ReaderControls
            currentPage={currentPage}
            totalPages={totalPages}
            canPrev={canPrev}
            canNext={canNext}
            onPrev={handlePrevPage}
            onNext={handleNextPage}
            onFirst={handleFirstPage}
            onLast={handleLastPage}
            spreadMode={spreadMode}
            onToggleSpreadMode={() => setSpreadMode(spreadMode === "single" ? "two-page" : "single")}
            isFullscreen={isFullscreen}
            onToggleFullscreen={handleToggleFullscreen}
            onOpenReaction={handleOpenReactionFromToolbar}
            className="shrink-0"
          />
        </div>
      </div>

      {/* Interactive Floating Panel Reaction Picker */}
      <ReactionPicker
        open={pickerState.open}
        x={pickerState.x}
        y={pickerState.y}
        onPick={handlePickReaction}
        onClose={() => setPickerState((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
