import { chaptersBySeries } from "./mockData";
import { getComicChapter } from "./comicChapters";

const GUEST_READ_KEY = "fyp-guest-read-series";
export const MAX_GUEST_COMICS = 2;
export const MAX_GUEST_CHAPTER_NUMBER = 2;

export function getGuestReadSeries(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GUEST_READ_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getChapterInfo(chapterId: string): { seriesId: string; chapterNumber: number } {
  // Check chaptersBySeries from mockData
  for (const [sId, chapters] of Object.entries(chaptersBySeries)) {
    const ch = chapters.find((c) => c.id === chapterId);
    if (ch) {
      return { seriesId: sId, chapterNumber: ch.number };
    }
  }

  // Check in comicChapters
  try {
    const comicCh = getComicChapter(chapterId);
    if (comicCh) {
      return { seriesId: comicCh.seriesId || "s1", chapterNumber: comicCh.number };
    }
  } catch {}

  const numMatch = chapterId.match(/ch(\d+)/i) || chapterId.match(/\d+/);
  const num = numMatch ? parseInt(numMatch[1] || numMatch[0], 10) : 1;
  return { seriesId: chapterId, chapterNumber: num };
}

export function getSeriesIdForChapter(chapterId: string): string {
  return getChapterInfo(chapterId).seriesId;
}

export type GuestReadResult = {
  allowed: boolean;
  reason?: "series_limit" | "chapter_limit";
  count: number;
  max: number;
  chapterNumber?: number;
};

export function recordGuestRead(chapterId: string): GuestReadResult {
  if (typeof window === "undefined") return { allowed: true, count: 0, max: MAX_GUEST_COMICS };

  const { seriesId, chapterNumber } = getChapterInfo(chapterId);

  // 1. Chapters beyond Chapter 2 are never accessible without login
  if (chapterNumber > MAX_GUEST_CHAPTER_NUMBER) {
    return {
      allowed: false,
      reason: "chapter_limit",
      count: getGuestReadSeries().length,
      max: MAX_GUEST_COMICS,
      chapterNumber
    };
  }

  const current = getGuestReadSeries();

  // 2. If this comic was already one of the 2 recorded guest reads, allow reading (for ch <= 2)
  if (current.includes(seriesId)) {
    return {
      allowed: true,
      count: current.length,
      max: MAX_GUEST_COMICS,
      chapterNumber
    };
  }

  // 3. If guest has already read 2 unique comics, block the 3rd comic
  if (current.length >= MAX_GUEST_COMICS) {
    return {
      allowed: false,
      reason: "series_limit",
      count: current.length,
      max: MAX_GUEST_COMICS,
      chapterNumber
    };
  }

  // 4. Record this comic as one of the 2 allowed guest reads
  const updated = [...current, seriesId];
  try {
    localStorage.setItem(GUEST_READ_KEY, JSON.stringify(updated));
  } catch {}

  return {
    allowed: true,
    count: updated.length,
    max: MAX_GUEST_COMICS,
    chapterNumber
  };
}

export function canGuestRead(chapterId: string): boolean {
  if (typeof window === "undefined") return true;

  const { seriesId, chapterNumber } = getChapterInfo(chapterId);

  // Chapter 3 and beyond is blocked for guests
  if (chapterNumber > MAX_GUEST_CHAPTER_NUMBER) {
    return false;
  }

  const current = getGuestReadSeries();
  if (current.includes(seriesId)) return true;
  return current.length < MAX_GUEST_COMICS;
}

export function getGuestReadsCount(): number {
  return getGuestReadSeries().length;
}
