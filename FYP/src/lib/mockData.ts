import type { Chapter, ChapterPage, Series } from "./types";

export const seriesList: Series[] = [
  {
    id: "s1",
    title: "Night City Blade",
    writerName: "S. Rava",
    genre: "Action",
    chapterCount: 12,
    readers: 48204,
    isLocked: false,
    earlyAccessPriceCoins: 5,
    coverUrl: "/placeholders/cover-1.svg",
    ambientColorHex: "#7C3AED"
  },
  {
    id: "s2",
    title: "Rose & Ruin",
    writerName: "A. Voss",
    genre: "Romance",
    chapterCount: 18,
    readers: 23110,
    isLocked: true,
    earlyAccessPriceCoins: 5,
    coverUrl: "/placeholders/cover-2.svg",
    ambientColorHex: "#F59E0B"
  },
  {
    id: "s3",
    title: "The Hollow Map",
    writerName: "N. Kade",
    genre: "Horror",
    chapterCount: 8,
    readers: 9721,
    isLocked: false,
    earlyAccessPriceCoins: 5,
    coverUrl: "/placeholders/cover-3.svg",
    ambientColorHex: "#EF4444"
  }
];

export const chaptersBySeries: Record<string, Chapter[]> = {
  s1: [
    { id: "c1", seriesId: "s1", number: 1, title: "Forge Spark", releaseDateIso: "2026-05-01", status: "Free", isLocked: false },
    { id: "c2", seriesId: "s1", number: 2, title: "Neon Oath", releaseDateIso: "2026-05-06", status: "Free", isLocked: false },
    { id: "c3", seriesId: "s1", number: 3, title: "Ghost Circuit", releaseDateIso: "2026-05-12", status: "Coins", coinPrice: 5, isLocked: true },
    { id: "c4", seriesId: "s1", number: 4, title: "Neon Vows", releaseDateIso: "2026-05-18", status: "Coins", coinPrice: 5, isLocked: true },
    { id: "c5", seriesId: "s1", number: 5, title: "Coming Soon", releaseDateIso: "2026-06-01", status: "ComingSoon", isLocked: true }
  ],
  s2: [
    { id: "c12", seriesId: "s2", number: 12, title: "Gilded Letters", releaseDateIso: "2026-05-12", status: "Free", isLocked: false },
    { id: "c13", seriesId: "s2", number: 13, title: "Ash Kisses", releaseDateIso: "2026-05-22", status: "Coins", coinPrice: 5, isLocked: true }
  ],
  s3: [
    { id: "c2", seriesId: "s3", number: 2, title: "The Door That Breathes", releaseDateIso: "2026-05-07", status: "Free", isLocked: false }
  ]
};

export function buildMockPages(chapterId: string): ChapterPage[] {
  // A small page set to demo: ambient sync + guided panel coords.
  const palettes = {
    c1: ["#7C3AED", "#2A145D", "#F59E0B"],
    c2: ["#7C3AED", "#111111", "#F59E0B"],
    c3: ["#7C3AED", "#EF4444", "#111111"],
    c4: ["#7C3AED", "#F59E0B", "#EF4444"],
    c12: ["#F59E0B", "#7C3AED", "#111111"],
    c13: ["#F59E0B", "#EF4444", "#111111"]
  } as Record<string, string[]>;

  const colors = palettes[chapterId] ?? ["#7C3AED", "#111111", "#F59E0B"];

  return Array.from({ length: 8 }).map((_, i) => {
    const ambientColorHex = colors[i % colors.length]!;
    return {
      id: `${chapterId}_p${i + 1}`,
      index: i + 1,
      imageUrl: i % 2 === 0 ? "/placeholders/panel-1.svg" : "/placeholders/panel-2.svg",
      // NOTE: Set this to a real loop (ogg/mp3) in /public/audio when you integrate real assets.
      audioUrl: undefined,
      mood: i % 3 === 0 ? "Suspense" : i % 3 === 1 ? "Action" : "Romantic",
      ambientColorHex,
      panelCoordinates: [
        { x: 0.06, y: 0.08, w: 0.44, h: 0.34 },
        { x: 0.54, y: 0.08, w: 0.40, h: 0.24 },
        { x: 0.54, y: 0.36, w: 0.40, h: 0.36 },
        { x: 0.06, y: 0.50, w: 0.44, h: 0.25 }
      ]
    } satisfies ChapterPage;
  });
}

