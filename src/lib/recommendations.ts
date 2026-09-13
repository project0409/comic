import type { Series, Chapter } from "./types";
import type { VaultHistoryItem, VaultBookmark } from "@/store/vaultStore";
import { chaptersBySeries } from "./mockData";

export interface ContinueReadingItem {
  series: Series;
  currentChapter: Chapter;
  nextChapter: Chapter;
  unreadCount: number;
  readAtIso: string;
}

export interface RecommendedSeriesItem {
  series: Series;
  score: number;
  reason: string;
}

/**
 * Identifies active, unfinished series from the user's reading history
 * and prioritizes the next unread chapter.
 * Sorted by most recently read first.
 */
export function getContinueReadingItems(
  history: VaultHistoryItem[],
  allSeries: Series[],
  chaptersMap: Record<string, Chapter[]> = chaptersBySeries
): ContinueReadingItem[] {
  if (!history || history.length === 0 || !allSeries || allSeries.length === 0) {
    return [];
  }

  // Group history by series ID, retaining the latest read entry
  const latestBySeries = new Map<string, VaultHistoryItem>();
  const allReadChaptersBySeries = new Map<string, Set<string>>();

  for (const item of history) {
    if (!latestBySeries.has(item.seriesId)) {
      latestBySeries.set(item.seriesId, item);
    }
    const readSet = allReadChaptersBySeries.get(item.seriesId) ?? new Set<string>();
    readSet.add(item.chapterId);
    allReadChaptersBySeries.set(item.seriesId, readSet);
  }

  const results: ContinueReadingItem[] = [];

  for (const [seriesId, latestItem] of latestBySeries.entries()) {
    const series = allSeries.find((s) => s.id === seriesId);
    if (!series) continue;

    const chapters = chaptersMap[seriesId] ?? [];
    if (chapters.length === 0) continue;

    // Sort chapters ascending by chapter number
    const sortedChapters = [...chapters].sort((a, b) => a.number - b.number);
    const readChapterIds = allReadChaptersBySeries.get(seriesId) ?? new Set();

    // Find current chapter object
    const currentChapter =
      sortedChapters.find((c) => c.id === latestItem.chapterId) ??
      sortedChapters[0];

    // Find next unread chapter (the first chapter with a higher number that hasn't been read)
    const nextChapter = sortedChapters.find(
      (c) => c.number > currentChapter.number && !readChapterIds.has(c.id)
    );

    // If an unread next chapter exists, add to continue reading
    if (nextChapter) {
      const unreadCount = sortedChapters.filter(
        (c) => !readChapterIds.has(c.id)
      ).length;

      results.push({
        series,
        currentChapter,
        nextChapter,
        unreadCount,
        readAtIso: latestItem.readAtIso,
      });
    }
  }

  // Sort by most recently read
  return results.sort(
    (a, b) => new Date(b.readAtIso).getTime() - new Date(a.readAtIso).getTime()
  );
}

/**
 * Calculates deterministic similar comic recommendations based on the user's
 * reading history, bookmarks, and favorite authors/genres.
 */
export function getPersonalizedRecommendations(
  history: VaultHistoryItem[],
  bookmarks: VaultBookmark[],
  allSeries: Series[],
  excludeSeriesIds: string[] = []
): RecommendedSeriesItem[] {
  if (!allSeries || allSeries.length === 0) return [];

  const excludeSet = new Set(excludeSeriesIds);

  // Identify interacted series
  const historySeriesIds = new Set(history.map((h) => h.seriesId));
  const bookmarkedTitles = new Set(bookmarks.map((b) => b.seriesName.toLowerCase()));

  const interactedSeries = allSeries.filter(
    (s) => historySeriesIds.has(s.id) || bookmarkedTitles.has(s.title.toLowerCase())
  );

  // If no history, return empty (caller should use getPopularRecommendations)
  if (interactedSeries.length === 0) {
    return [];
  }

  // Build user preference profile
  const favAuthors = new Set<string>();
  const favGenres = new Set<string>();
  const favKeywords = new Set<string>();

  for (const s of interactedSeries) {
    if (s.writerName) favAuthors.add(s.writerName.toLowerCase());
    if (s.genre) favGenres.add(s.genre.toLowerCase());
    if (s.searchKeywords) {
      s.searchKeywords.forEach((k) => favKeywords.add(k.toLowerCase()));
    }
  }

  // Most recent read genre
  const mostRecentSeriesId = history[0]?.seriesId;
  const mostRecentSeries = allSeries.find((s) => s.id === mostRecentSeriesId);
  const mostRecentGenre = mostRecentSeries?.genre?.toLowerCase();

  const candidates: RecommendedSeriesItem[] = [];

  for (const candidate of allSeries) {
    // Skip excluded series (e.g. series already being read in Continue Reading)
    if (excludeSet.has(candidate.id)) continue;

    let score = 0;
    let reason = "";

    const candidateAuthor = candidate.writerName?.toLowerCase();
    const candidateGenre = candidate.genre?.toLowerCase();

    // +4 Same author
    if (candidateAuthor && favAuthors.has(candidateAuthor)) {
      score += 4;
      reason = `More by ${candidate.writerName}`;
    }

    // +3 Matching genre
    if (candidateGenre && favGenres.has(candidateGenre)) {
      score += 3;
      if (!reason) reason = `Because you read ${candidate.genre}`;
    }

    // +2 Matching tags/keywords
    const matchedKeyword = candidate.searchKeywords?.find((k) =>
      favKeywords.has(k.toLowerCase())
    );
    if (matchedKeyword) {
      score += 2;
      if (!reason) reason = `Similar theme: "${matchedKeyword}"`;
    }

    // +2 Similarity to most recently read series
    if (candidateGenre && mostRecentGenre && candidateGenre === mostRecentGenre) {
      score += 2;
      if (!reason) reason = `Based on your recent read`;
    }

    // +1 Popular/trending signal
    if (candidate.readers >= 30_000 || candidate.rating >= 4.8) {
      score += 1;
    }

    // Only include if there is some relevance score
    if (score > 0) {
      candidates.push({
        series: candidate,
        score,
        reason: reason || `Recommended in ${candidate.genre}`,
      });
    }
  }

  // Sort by score descending, then rating descending, then readers descending
  return candidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.series.rating !== a.series.rating) return b.series.rating - a.series.rating;
    return b.series.readers - a.series.readers;
  });
}

/**
 * Fallback recommendations using popularity/trending data for users without history.
 */
export function getPopularRecommendations(allSeries: Series[], count = 6): Series[] {
  if (!allSeries || allSeries.length === 0) return [];
  return [...allSeries]
    .sort((a, b) => {
      const scoreA = (a.readers / 1000) * 0.7 + a.rating * 10;
      const scoreB = (b.readers / 1000) * 0.7 + b.rating * 10;
      return scoreB - scoreA;
    })
    .slice(0, count);
}
