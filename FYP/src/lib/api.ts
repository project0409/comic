import type { ChapterPage, Series } from "./types";

export async function getSeriesList(): Promise<Series[]> {
  const res = await fetch("/api/series", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load series");
  return res.json();
}

export async function getChapterPages(chapterId: string): Promise<ChapterPage[]> {
  const res = await fetch(`/api/chapters/${chapterId}/pages`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load pages");
  return res.json();
}
