"use client";

import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight, AlertCircle, Loader2, Smile } from "lucide-react";
import { cn } from "@/components/cn";
import type { ComicPageItem } from "@/lib/comicChapters";
import type { VaultReaction } from "@/store/vaultStore";

export interface PanelClickCoords {
  relX: number;
  relY: number;
  clientX: number;
  clientY: number;
}

export interface PageFlipProps {
  pages: ComicPageItem[];
  currentPage: number; // 1-indexed
  onPageChange: (newPage: number) => void;
  spreadMode?: "single" | "two-page";
  isTurning: boolean;
  setIsTurning: (v: boolean) => void;
  className?: string;
  onTapLeft?: () => void;
  onTapRight?: () => void;
  reactions?: VaultReaction[];
  onPanelClick?: (e: React.MouseEvent, pageNumber: number, coords: PanelClickCoords) => void;
}

export function PageFlip({
  pages,
  currentPage,
  onPageChange,
  spreadMode = "single",
  isTurning,
  setIsTurning,
  className,
  onTapLeft,
  onTapRight,
  reactions = [],
  onPanelClick
}: PageFlipProps) {
  // Check user prefers-reduced-motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // Animation state: direction of turn and degree of progress
  const [turnDirection, setTurnDirection] = useState<"next" | "prev" | null>(null);
  const [animatingPage, setAnimatingPage] = useState(currentPage);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const media = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(media.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }
  }, []);

  // Preload neighboring page images into browser cache
  useEffect(() => {
    if (!pages || pages.length === 0) return;
    const indicesToPreload = [currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
    indicesToPreload.forEach((idx) => {
      const page = pages[idx - 1];
      if (page && !loadedImages[page.imageUrl]) {
        const img = new Image();
        img.src = page.imageUrl;
        img.onload = () => {
          setLoadedImages((prev) => ({ ...prev, [page.imageUrl]: true }));
        };
        img.onerror = () => {
          setFailedImages((prev) => ({ ...prev, [page.imageUrl]: true }));
        };
      }
    });
  }, [pages, currentPage, loadedImages]);

  // Synchronize internal page when prop changes if not turning
  useEffect(() => {
    if (!isTurning) {
      setAnimatingPage(currentPage);
    }
  }, [currentPage, isTurning]);

  if (!pages || pages.length === 0) {
    return (
      <div className="w-full aspect-[3/4] max-h-[75vh] flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-card p-8 text-center text-muted space-y-3">
        <AlertCircle className="h-10 w-10 text-primary/60" />
        <div className="font-semibold text-white">No Comic Pages Available</div>
        <p className="text-xs text-muted max-w-xs">
          This chapter currently has no pages loaded. Please select another chapter.
        </p>
      </div>
    );
  }

  const safeCurrent = Math.min(Math.max(1, currentPage), pages.length);
  const currentPageItem = pages[safeCurrent - 1];
  const nextPageIndex = safeCurrent < pages.length ? safeCurrent + 1 : null;
  const prevPageIndex = safeCurrent > 1 ? safeCurrent - 1 : null;

  // Single page or Two-page spread items
  const isTwoPage = spreadMode === "two-page" && pages.length > 1;
  const leftPageNum = isTwoPage ? (safeCurrent % 2 === 0 ? safeCurrent - 1 : safeCurrent) : safeCurrent;
  const rightPageNum = isTwoPage ? leftPageNum + 1 : safeCurrent;

  const leftPageItem = pages[leftPageNum - 1];
  const rightPageItem = isTwoPage && rightPageNum <= pages.length ? pages[rightPageNum - 1] : null;

  const currentPageReactions = reactions.filter((r) => r.pageIndex === safeCurrent);
  const leftPageReactions = reactions.filter((r) => r.pageIndex === leftPageNum);
  const rightPageReactions = isTwoPage ? reactions.filter((r) => r.pageIndex === rightPageNum) : [];

  return (
    <div
      className={cn(
        "relative w-full mx-auto select-none flex items-center justify-center",
        className
      )}
      style={{
        perspective: "2200px"
      }}
    >
      {/* 3D Comic Book Binding Container */}
      <div
        className={cn(
          "comic-page relative flex items-center justify-center",
          isTwoPage
            ? "aspect-[16/10] sm:aspect-[8/5]"
            : "aspect-[3/4]"
        )}
        style={{
          transformStyle: "preserve-3d"
        }}
      >
        {/* PHYSICAL BOOK OUTER SHADOW & DEPTH */}
        <div className="absolute inset-0 -m-3 sm:-m-5 rounded-3xl bg-black/60 blur-2xl pointer-events-none -z-10" />
        <div className="absolute inset-0 rounded-2xl bg-black/40 shadow-2xl pointer-events-none -z-10 border border-white/5" />

        {/* TWO-PAGE SPREAD MODE */}
        {isTwoPage ? (
          <div className="relative w-full h-full flex rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#080a10]">
            {/* Left Page Leaf */}
            <div className="relative w-1/2 h-full overflow-hidden border-r border-black/40 bg-[#0a0d17]">
              {leftPageItem ? (
                <PageCanvas
                  page={leftPageItem}
                  failed={failedImages[leftPageItem.imageUrl]}
                  reactions={leftPageReactions}
                  onPanelClick={onPanelClick}
                />
              ) : (
                <div className="w-full h-full bg-black/30" />
              )}
              {/* Inner spine shadow (Left) */}
              <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black/80 via-black/30 to-transparent" />
            </div>

            {/* Central Binding Spine Gutter */}
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-4 z-20 pointer-events-none bg-gradient-to-r from-black/60 via-black/90 to-black/60 shadow-[0_0_12px_rgba(0,0,0,0.8)]" />

            {/* Right Page Leaf */}
            <div className="relative w-1/2 h-full overflow-hidden bg-[#0a0d17]">
              {rightPageItem ? (
                <PageCanvas
                  page={rightPageItem}
                  failed={failedImages[rightPageItem.imageUrl]}
                  reactions={rightPageReactions}
                  onPanelClick={onPanelClick}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-muted/50 bg-black/30">
                  End of Chapter
                </div>
              )}
              {/* Inner spine shadow (Right) */}
              <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
            </div>
          </div>
        ) : (
          /* SINGLE PAGE 3D FLIP CONTAINER */
          <div
            className="relative w-full h-full rounded-2xl overflow-hidden shadow-[0_16px_50px_rgba(0,0,0,0.7)] border border-white/10 bg-[#090b14]"
            style={{
              transformStyle: "preserve-3d"
            }}
          >
            {/* Underlying Next/Previous Page (Revealed under flip) */}
            <div className="absolute inset-0 w-full h-full bg-[#060810] -z-10 overflow-hidden">
              {turnDirection === "next" && nextPageIndex && pages[nextPageIndex - 1] ? (
                <PageCanvas page={pages[nextPageIndex - 1]} failed={failedImages[pages[nextPageIndex - 1].imageUrl]} />
              ) : turnDirection === "prev" && prevPageIndex && pages[prevPageIndex - 1] ? (
                <PageCanvas page={pages[prevPageIndex - 1]} failed={failedImages[pages[prevPageIndex - 1].imageUrl]} />
              ) : (
                <PageCanvas page={currentPageItem} failed={failedImages[currentPageItem.imageUrl]} />
              )}
            </div>

            {/* Current Active Turning Page Leaf */}
            <div
              className={cn(
                "relative w-full h-full transition-transform duration-500 ease-out origin-left",
                isTurning && turnDirection === "next" && (prefersReducedMotion ? "opacity-0 transition-opacity duration-300" : "-rotate-y-90 scale-[0.98] shadow-2xl"),
                isTurning && turnDirection === "prev" && (prefersReducedMotion ? "opacity-0 transition-opacity duration-300" : "rotate-y-90 scale-[0.98] shadow-2xl")
              )}
              style={{
                transformStyle: "preserve-3d"
              }}
            >
              <PageCanvas
                page={currentPageItem}
                failed={failedImages[currentPageItem.imageUrl]}
                reactions={currentPageReactions}
                onPanelClick={onPanelClick}
              />

              {/* Realistic Paper Spine Shadow on Left Edge */}
              <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/60 via-black/25 to-transparent z-10" />

              {/* Realistic 3D Page Curl Gradient when turning */}
              {isTurning && (
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-black/40 z-20 animate-pulse" />
              )}
            </div>
          </div>
        )}

        {/* CLICKABLE TAP ZONES ON EDGES FOR FLIPPING PAGES */}
        {/* Left Side: Prev Page */}
        <button
          type="button"
          onClick={onTapLeft}
          aria-label="Previous Page"
          className={cn(
            "group/zone absolute inset-y-0 left-0 w-[15%] sm:w-[16%] z-30 flex items-center justify-start pl-2 sm:pl-3 transition-colors",
            "bg-gradient-to-r from-black/35 via-transparent to-transparent opacity-0 hover:opacity-100 cursor-w-resize"
          )}
        >
          <div className="p-2 sm:p-2.5 rounded-full bg-black/70 border border-white/20 text-white/90 shadow-xl group-hover/zone:scale-110 group-hover/zone:bg-primary group-hover/zone:text-white transition-all">
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </button>

        {/* Right Side: Next Page */}
        <button
          type="button"
          onClick={onTapRight}
          aria-label="Next Page"
          className={cn(
            "group/zone absolute inset-y-0 right-0 w-[15%] sm:w-[16%] z-30 flex items-center justify-end pr-2 sm:pr-3 transition-colors",
            "bg-gradient-to-l from-black/35 via-transparent to-transparent opacity-0 hover:opacity-100 cursor-e-resize"
          )}
        >
          <div className="p-2 sm:p-2.5 rounded-full bg-black/70 border border-white/20 text-white/90 shadow-xl group-hover/zone:scale-110 group-hover/zone:bg-primary group-hover/zone:text-white transition-all">
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </button>
      </div>
    </div>
  );
}

// Subcomponent rendering a single comic page safely with aspect ratio preservation and emoji reactions
function PageCanvas({
  page,
  failed,
  reactions = [],
  onPanelClick
}: {
  page: ComicPageItem;
  failed?: boolean;
  reactions?: VaultReaction[];
  onPanelClick?: (e: React.MouseEvent, pageNumber: number, coords: PanelClickCoords) => void;
}) {
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    if (!onPanelClick) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) {
      onPanelClick(e, page.pageNumber, { relX: 50, relY: 50, clientX: e.clientX, clientY: e.clientY });
      return;
    }
    const relX = Math.round(Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100)));
    const relY = Math.round(Math.max(5, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100)));
    onPanelClick(e, page.pageNumber, { relX, relY, clientX: e.clientX, clientY: e.clientY });
  };

  return (
    <div
      ref={canvasRef}
      onClick={handleClick}
      className="group/pagecanvas relative w-full h-full flex items-center justify-center bg-[#070913] select-none overflow-hidden cursor-pointer"
      title="Click on panel to react with emoji"
    >
      {/* Subtle hover tooltip hint */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none opacity-0 group-hover/pagecanvas:opacity-100 transition-opacity">
        <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-black/85 border border-white/20 text-white/90 shadow-2xl flex items-center gap-1.5 backdrop-blur-md">
          <Smile className="h-3.5 w-3.5 text-primary" />
          <span>Click panel to react</span>
        </span>
      </div>

      {/* Loading Skeleton */}
      {loading && !failed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-muted gap-2 z-10 animate-pulse">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-[11px] font-semibold text-white/70">Loading Page {page.pageNumber}...</span>
        </div>
      )}

      {/* Comic Page Image */}
      {failed ? (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-muted bg-card/60">
          <AlertCircle className="h-8 w-8 text-rose-500/80 mb-2" />
          <div className="text-sm font-semibold text-white">Image Failed to Load</div>
          <p className="text-xs text-muted mt-1">{page.caption || `Page ${page.pageNumber}`}</p>
        </div>
      ) : (
        <img
          src={page.imageUrl}
          alt={page.caption || `Comic Page ${page.pageNumber}`}
          className="w-full h-full object-contain pointer-events-none drop-shadow-md"
          loading="eager"
          onLoad={() => setLoading(false)}
          onError={() => setLoading(false)}
        />
      )}

      {/* Render Placed Emoji Reactions on the Panel */}
      {reactions.map((r) => (
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
  );
}
