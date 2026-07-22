import type { Chapter, ChapterPage, ReleaseCalendarItem, Series } from "./types";

export const firstChapterBySeries: Record<string, string> = {
  s1: "c1",
  s2: "c12",
  s3: "c2",
  s4: "c20"
};

export const platformStats = {
  avgRating: 4.8,
  monthlyReads: 130_000,
  activeCreators: 5
};

export const releaseCalendar: ReleaseCalendarItem[] = [
  {
    id: "rc1",
    title: "Cyberpunk Ch. 3: Ghost Grid",
    genre: "Sci-Fi",
    subgenre: "Cyberpunk",
    releaseDateLabel: "July 20, 2026",
    status: "ComingSoon"
  },
  {
    id: "rc2",
    title: "Dragon Forge Ch. 2: Engine",
    genre: "Steampunk",
    subgenre: "Action",
    releaseDateLabel: "July 25, 2026",
    status: "ComingSoon"
  },
  {
    id: "rc3",
    title: "Cyberpunk Ch. 4: Neural Melt",
    genre: "Sci-Fi",
    subgenre: "Cyberpunk",
    releaseDateLabel: "Pending Approval",
    status: "InQueue"
  }
];

export const seriesList: Series[] = [
  {
    id: "s1",
    title: "Cyberpunk Odyssey: Neo-Zenith",
    writerName: "Sanjay V.",
    genre: "Sci-Fi",
    chapterCount: 3,
    readers: 42_800,
    rating: 4.8,
    description:
      "In the neon-drenched sprawl of Neo-Zenith, a rogue neural hacker discovers a secret database that could dismantle the city's corporate overlords. The AI Lore Master watches from the dark net...",
    isLocked: false,
    earlyAccessPriceCoins: 5,
    coverUrl: "/placeholders/cover-1.svg",
    ambientColorHex: "#7C3AED"
  },
  {
    id: "s2",
    title: "Shadow of the Dragon",
    writerName: "Rupa D.",
    genre: "Fantasy",
    chapterCount: 2,
    readers: 89_200,
    rating: 4.9,
    description:
      "Ancient iron swords clash with biological dragon-drives in an imperial steampunk world. Can the last runic smith forge the core before the capital burns?",
    isLocked: false,
    earlyAccessPriceCoins: 5,
    coverUrl: "/placeholders/cover-2.svg",
    ambientColorHex: "#F59E0B"
  },
  {
    id: "s3",
    title: "Night City Blade",
    writerName: "S. Rava",
    genre: "Action",
    chapterCount: 12,
    readers: 48_204,
    rating: 4.7,
    description:
      "A blade-for-hire navigates the underbelly of a megacity where every alley hides a syndicate and every rooftop holds a sniper.",
    isLocked: false,
    earlyAccessPriceCoins: 5,
    coverUrl: "/placeholders/cover-3.svg",
    ambientColorHex: "#EF4444"
  },
  {
    id: "s4",
    title: "The Hollow Map",
    writerName: "N. Kade",
    genre: "Sci-Fi",
    chapterCount: 8,
    readers: 9_721,
    rating: 4.6,
    description:
      "Cartographers chart a dimension that rewrites itself nightly. Every line drawn becomes a door — and every door opens both ways.",
    isLocked: true,
    earlyAccessPriceCoins: 5,
    coverUrl: "/placeholders/cover-3.svg",
    ambientColorHex: "#00E5FF"
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
    { id: "c12", seriesId: "s2", number: 1, title: "Gilded Letters", releaseDateIso: "2026-05-12", status: "Free", isLocked: false },
    { id: "c13", seriesId: "s2", number: 2, title: "Ash Kisses", releaseDateIso: "2026-05-22", status: "Coins", coinPrice: 5, isLocked: true }
  ],
  s3: [
    { id: "c2", seriesId: "s3", number: 2, title: "The Door That Breathes", releaseDateIso: "2026-05-07", status: "Free", isLocked: false }
  ],
  s4: [
    { id: "c20", seriesId: "s4", number: 1, title: "First Fold", releaseDateIso: "2026-05-01", status: "Free", isLocked: false }
  ]
};

export function buildMockPages(chapterId: string): ChapterPage[] {
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
