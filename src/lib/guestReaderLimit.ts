import { chaptersBySeries } from "./mockData";

const GUEST_READ_KEY = "fyp-guest-read-series";
export const MAX_GUEST_COMICS = 2;

export function getGuestReadSeries(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GUEST_READ_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getSeriesIdForChapter(chapterId: string): string {
  for (const [sId, chapters] of Object.entries(chaptersBySeries)) {
    if (chapters.some((c) => c.id === chapterId)) {
      return sId;
    }
  }
  return chapterId;
}

export function recordGuestRead(chapterId: string): { allowed: boolean; count: number; max: number } {
  if (typeof window === "undefined") return { allowed: true, count: 0, max: MAX_GUEST_COMICS };
  const sId = getSeriesIdForChapter(chapterId);
  const current = getGuestReadSeries();

  // If this comic series was already read by this guest, permit reading
  if (current.includes(sId)) {
    return { allowed: true, count: current.length, max: MAX_GUEST_COMICS };
  }

  // If already read 2 unique comics, block the 3rd one
  if (current.length >= MAX_GUEST_COMICS) {
    return { allowed: false, count: current.length, max: MAX_GUEST_COMICS };
  }

  // Record this comic as one of the 2 allowed guest reads
  const updated = [...current, sId];
  try {
    localStorage.setItem(GUEST_READ_KEY, JSON.stringify(updated));
  } catch {}

  return { allowed: true, count: updated.length, max: MAX_GUEST_COMICS };
}

export function canGuestRead(chapterId: string): boolean {
  if (typeof window === "undefined") return true;
  const sId = getSeriesIdForChapter(chapterId);
  const current = getGuestReadSeries();
  if (current.includes(sId)) return true;
  return current.length < MAX_GUEST_COMICS;
}

export function getGuestReadsCount(): number {
  return getGuestReadSeries().length;
}
