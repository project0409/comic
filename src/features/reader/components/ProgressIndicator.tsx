"use client";

import { cn } from "@/components/cn";

interface ProgressIndicatorProps {
  currentPage: number; // 1-indexed
  totalPages: number;
  onSeekPage?: (page: number) => void;
  className?: string;
  showScrubber?: boolean;
}

export function ProgressIndicator({
  currentPage,
  totalPages,
  onSeekPage,
  className,
  showScrubber = true
}: ProgressIndicatorProps) {
  const safeTotal = Math.max(1, totalPages);
  const safeCurrent = Math.min(Math.max(1, currentPage), safeTotal);
  const percentage = Math.round((safeCurrent / safeTotal) * 100);

  return (
    <div className={cn("flex items-center gap-3 select-none text-xs font-medium text-white/90", className)}>
      {/* Page Counter Badge */}
      <div
        className="px-3 py-1 rounded-xl bg-white/10 border border-white/15 text-xs font-semibold tabular-nums text-white shadow-sm flex items-center gap-1.5 shrink-0"
        aria-live="polite"
        aria-label={`Page ${safeCurrent} of ${safeTotal}`}
      >
        <span className="text-muted text-[11px] uppercase font-bold">Page</span>
        <span className="text-primary font-bold">{safeCurrent}</span>
        <span className="text-muted/60">/</span>
        <span>{safeTotal}</span>
      </div>

      {/* Scrubber Progress Bar */}
      {showScrubber && (
        <div className="flex-1 min-w-[80px] sm:min-w-[140px] flex items-center gap-2 group">
          <div
            role="progressbar"
            aria-valuenow={safeCurrent}
            aria-valuemin={1}
            aria-valuemax={safeTotal}
            aria-label={`Reading progress: ${percentage}%`}
            onClick={(e) => {
              if (!onSeekPage) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const ratio = Math.max(0, Math.min(1, clickX / rect.width));
              const targetPage = Math.round(ratio * (safeTotal - 1)) + 1;
              onSeekPage(targetPage);
            }}
            className={cn(
              "relative h-2 flex-1 rounded-full bg-white/15 overflow-hidden transition-all",
              onSeekPage ? "cursor-pointer hover:h-2.5" : ""
            )}
          >
            <div
              className="h-full bg-gradient-to-r from-primary via-indigo-500 to-pink-500 rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-[11px] text-muted tabular-nums shrink-0 hidden sm:inline">
            {percentage}%
          </span>
        </div>
      )}
    </div>
  );
}
