"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, BookOpen, Check } from "lucide-react";
import { cn } from "@/components/cn";
import { COMIC_CHAPTERS, type ComicChapterItem } from "@/lib/comicChapters";

interface ChapterSelectorProps {
  currentChapterId: string;
  chapters?: ComicChapterItem[];
  onSelectChapter: (chapterId: string) => void;
  className?: string;
}

export function ChapterSelector({
  currentChapterId,
  chapters = COMIC_CHAPTERS,
  onSelectChapter,
  className
}: ChapterSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentChapter =
    chapters.find((c) => c.id === currentChapterId || `c${c.number}` === currentChapterId) ||
    chapters[0] ||
    COMIC_CHAPTERS[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className={cn("relative inline-block text-left select-none", className)}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select Chapter"
        className={cn(
          "flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border transition-all cursor-pointer shadow-sm text-xs font-semibold",
          "bg-white/5 border-white/15 hover:border-primary/50 hover:bg-white/10 text-white",
          isOpen && "border-primary ring-2 ring-primary/20 bg-white/10"
        )}
      >
        <BookOpen className="h-3.5 w-3.5 text-primary shrink-0" />
        <span className="truncate max-w-[200px] sm:max-w-[280px]">
          {currentChapter?.displayTitle || `Chapter ${currentChapter?.number || 1}`}
        </span>
        <ChevronDown
          className={cn("h-3.5 w-3.5 text-muted transition-transform duration-200 shrink-0", isOpen && "rotate-180")}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 mt-2 w-72 sm:w-80 rounded-2xl border border-white/15 bg-card/95 backdrop-blur-2xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-muted border-b border-white/10">
            Select Chapter
          </div>
          <div className="max-h-64 overflow-y-auto py-1 space-y-1">
            {chapters.map((chap) => {
              const isSelected =
                chap.id === currentChapterId || `c${chap.number}` === currentChapterId;
              return (
                <button
                  key={chap.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onSelectChapter(chap.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-left transition text-xs font-medium cursor-pointer",
                    isSelected
                      ? "bg-primary/20 text-primary font-semibold border border-primary/30"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-white font-semibold">{chap.displayTitle}</div>
                    {chap.subtitle && (
                      <div className="text-[10px] text-muted truncate">{chap.subtitle}</div>
                    )}
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
