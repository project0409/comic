import type { Series, Author } from "./types";
import type { VaultBookmark } from "@/store/vaultStore";
import { mockAuthors } from "./mockData";

export interface EnrichedAuthor extends Author {
  comicCount: number;
  totalReaders: number;
  genres: string[];
}

/**
 * Calculates a deterministic trending score based on available real metrics:
 * - Readers / Views count
 * - Star Rating
 * - User Bookmarks / Saves
 */
export function getTrendingComics(
  allSeries: Series[],
  bookmarks: VaultBookmark[] = []
): Series[] {
  if (!allSeries || allSeries.length === 0) return [];

  // Count bookmarks per series title
  const bookmarkCounts = new Map<string, number>();
  for (const b of bookmarks) {
    const key = b.seriesName.toLowerCase();
    bookmarkCounts.set(key, (bookmarkCounts.get(key) ?? 0) + 1);
  }

  return [...allSeries].sort((a, b) => {
    const aBookmarks = bookmarkCounts.get(a.title.toLowerCase()) ?? 0;
    const bBookmarks = bookmarkCounts.get(b.title.toLowerCase()) ?? 0;

    const scoreA = (a.readers / 1000) * 1.0 + a.rating * 10 + aBookmarks * 5;
    const scoreB = (b.readers / 1000) * 1.0 + b.rating * 10 + bBookmarks * 5;

    return scoreB - scoreA;
  });
}

/**
 * Calculates deterministic rankings for Top Authors using real project data:
 * - isTopAuthor verified status
 * - Number of published series
 * - Total reader reach across all published series
 * - Real follower counts
 */
export function getTopAuthors(
  authors: Author[] = mockAuthors,
  allSeries: Series[]
): EnrichedAuthor[] {
  if (!authors || authors.length === 0) return [];

  const enriched: EnrichedAuthor[] = authors.map((author) => {
    const authorSeries = allSeries.filter(
      (s) => s.writerName.trim().toLowerCase() === author.name.trim().toLowerCase()
    );

    const comicCount = authorSeries.length;
    const totalReaders = authorSeries.reduce((acc, s) => acc + (s.readers || 0), 0);
    const genres = Array.from(new Set(authorSeries.map((s) => s.genre)));

    return {
      ...author,
      comicCount,
      totalReaders,
      genres,
    };
  });

  return enriched.sort((a, b) => {
    // Top Authors get prioritized
    const topScoreA = a.isTopAuthor ? 500 : 0;
    const topScoreB = b.isTopAuthor ? 500 : 0;

    const rankA = topScoreA + a.totalReaders / 200 + (a.followerCount || 0) / 5 + a.comicCount * 50;
    const rankB = topScoreB + b.totalReaders / 200 + (b.followerCount || 0) / 5 + b.comicCount * 50;

    return rankB - rankA;
  });
}
