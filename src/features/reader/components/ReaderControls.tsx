"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Columns,
  Maximize2,
  Minimize2,
  Smile,
  Square
} from "lucide-react";
import { Button } from "@/components/Button";
import { cn } from "@/components/cn";

interface ReaderControlsProps {
  currentPage: number;
  totalPages: number;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onFirst: () => void;
  onLast: () => void;
  spreadMode?: "single" | "two-page";
  onToggleSpreadMode?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onOpenReaction?: () => void;
  className?: string;
}

export function ReaderControls({
  currentPage,
  totalPages,
  canPrev,
  canNext,
  onPrev,
  onNext,
  onFirst,
  onLast,
  spreadMode = "single",
  onToggleSpreadMode,
  isFullscreen = false,
  onToggleFullscreen,
  onOpenReaction,
  className
}: ReaderControlsProps) {
  return (
    <div
      role="toolbar"
      aria-label="Comic reader controls"
      className={cn("flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center", className)}
    >
      {/* First Page Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onFirst}
        disabled={!canPrev}
        aria-label="First page (Home)"
        title="First Page (Home)"
        className="h-8 w-8 p-0 text-white/90 disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>

      {/* Previous Page Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onPrev}
        disabled={!canPrev}
        aria-label="Previous page (Arrow Left)"
        title="Previous Page (ArrowLeft)"
        className="h-8 px-2.5 sm:px-3 text-xs gap-1 text-white/90 disabled:opacity-30 disabled:hover:bg-transparent font-semibold"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Prev</span>
      </Button>

      {/* Next Page Button */}
      <Button
        variant="primary"
        size="sm"
        onClick={onNext}
        disabled={!canNext}
        aria-label="Next page (Arrow Right)"
        title="Next Page (ArrowRight)"
        className="h-8 px-3 sm:px-4 text-xs gap-1 font-bold shadow-md shadow-primary/20 disabled:opacity-30 disabled:hover:bg-primary/50"
      >
        <span>Next</span>
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Last Page Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onLast}
        disabled={!canNext}
        aria-label="Last page (End)"
        title="Last Page (End)"
        className="h-8 w-8 p-0 text-white/90 disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>

      {/* Emoji Reaction Button */}
      {onOpenReaction && (
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenReaction}
          aria-label="Add panel reaction emoji"
          title="Add Emoji Reaction"
          className="h-8 px-2.5 sm:px-3 text-xs gap-1.5 text-white/90 hover:text-white hover:border-amber-400/50"
        >
          <Smile className="h-4 w-4 text-amber-400" />
          <span className="hidden sm:inline font-semibold">React</span>
        </Button>
      )}

      <div className="h-5 w-[1px] bg-white/10 mx-1 hidden sm:block" />

      {/* Two-page spread toggle for desktop */}
      {onToggleSpreadMode && (
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleSpreadMode}
          aria-label={spreadMode === "two-page" ? "Switch to single page view" : "Switch to two-page spread view"}
          title={spreadMode === "two-page" ? "Switch to Single Page" : "Switch to Two-Page Spread"}
          className="h-8 px-2 text-xs gap-1.5 text-muted hover:text-white hidden md:inline-flex"
        >
          {spreadMode === "two-page" ? (
            <>
              <Square className="h-3.5 w-3.5" />
              <span>1-Page</span>
            </>
          ) : (
            <>
              <Columns className="h-3.5 w-3.5 text-primary" />
              <span>2-Page</span>
            </>
          )}
        </Button>
      )}

      {/* Fullscreen Toggle */}
      {onToggleFullscreen && (
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleFullscreen}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          title={isFullscreen ? "Exit Fullscreen (Escape)" : "Fullscreen Mode"}
          className={cn(
            "h-8 px-2 text-xs gap-1 text-muted hover:text-white transition",
            isFullscreen && "border-primary text-primary bg-primary/10"
          )}
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Exit</span>
            </>
          ) : (
            <>
              <Maximize2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Full</span>
            </>
          )}
        </Button>
      )}
    </div>
  );
}
