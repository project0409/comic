import type { Chapter, ChapterPage, ReleaseCalendarItem, Series, Author } from "./types";

export const firstChapterBySeries: Record<string, string> = {
  s1: "c1",
  s2: "c12",
  s3: "c2",
  s4: "c20",
  s5: "c30",
  s6: "c40",
  s7: "c50"
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
    status: "ComingSoon",
    writerName: "Sanjay V."
  },
  {
    id: "rc2",
    title: "Dragon Forge Ch. 2: Engine",
    genre: "Steampunk",
    subgenre: "Action",
    releaseDateLabel: "July 25, 2026",
    status: "ComingSoon",
    writerName: "Rupa D."
  },
  {
    id: "rc3",
    title: "Cyberpunk Ch. 4: Neural Melt",
    genre: "Sci-Fi",
    subgenre: "Cyberpunk",
    releaseDateLabel: "Pending Approval",
    status: "InQueue",
    writerName: "Sanjay V."
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
    searchKeywords: ["neural hacker", "Neo-Zenith", "corporate overlords", "dark net", "AI Lore Master", "secret database", "neon city"],
    isLocked: false,
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
    searchKeywords: ["dragon", "runic smith", "capital burns", "dragon-drives", "iron swords", "forge core", "imperial steampunk"],
    isLocked: false,
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
    searchKeywords: ["blade-for-hire", "megacity", "syndicate", "rooftop sniper", "night alley", "contract fight", "chase scene"],
    isLocked: false,
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
    searchKeywords: ["cartographers", "living map", "dimension doors", "rewrites nightly", "folded room", "impossible map"],
    isLocked: true,
    coverUrl: "/placeholders/cover-3.svg",
    ambientColorHex: "#00E5FF"
  },
  {
    id: "s5",
    title: "Rose Circuit Hearts",
    writerName: "Mira K.",
    genre: "Romance",
    chapterCount: 6,
    readers: 31_540,
    rating: 4.8,
    description:
      "Two rival pilots trade encrypted love notes across a citywide race where every finish line changes their future.",
    searchKeywords: ["rival pilots", "encrypted love notes", "city race", "finish line", "romantic chase", "rose circuit"],
    isLocked: false,
    coverUrl: "/placeholders/cover-1.svg",
    ambientColorHex: "#FF4F7B"
  },
  {
    id: "s6",
    title: "Midnight Static",
    writerName: "A. Varun",
    genre: "Horror",
    chapterCount: 5,
    readers: 26_810,
    rating: 4.6,
    description:
      "A late-night radio host receives calls from vanished listeners, each one describing a nightmare that is about to happen.",
    searchKeywords: ["radio host", "vanished listeners", "nightmare call", "dead air", "midnight broadcast", "haunted signal"],
    isLocked: false,
    coverUrl: "/placeholders/cover-2.svg",
    ambientColorHex: "#7F1D1D"
  },
  {
    id: "s7",
    title: "The Glass Alibi",
    writerName: "I. Sen",
    genre: "Mystery",
    chapterCount: 7,
    readers: 18_402,
    rating: 4.7,
    description:
      "A detective follows clues through mirrored rooms where every suspect has a perfect reflection and one impossible lie.",
    searchKeywords: ["detective", "mirrored rooms", "suspects", "perfect reflection", "impossible lie", "glass alibi"],
    isLocked: false,
    coverUrl: "/placeholders/cover-3.svg",
    ambientColorHex: "#00A8C8"
  }
];

const initialChaptersBySeries: Record<string, Chapter[]> = {
  s1: [
    { id: "c1", seriesId: "s1", number: 1, title: "Forge Spark", releaseDateIso: "2026-05-01", status: "Free", isLocked: false },
    { id: "c2", seriesId: "s1", number: 2, title: "Neon Oath", releaseDateIso: "2026-05-06", status: "Free", isLocked: false },
    { id: "c3", seriesId: "s1", number: 3, title: "Ghost Circuit", releaseDateIso: "2026-05-12", status: "Free", isLocked: false },
    { id: "c4", seriesId: "s1", number: 4, title: "Neon Vows", releaseDateIso: "2026-05-18", status: "Free", isLocked: false },
    { id: "c5", seriesId: "s1", number: 5, title: "Coming Soon", releaseDateIso: "2026-06-01", status: "ComingSoon", isLocked: false }
  ],
  s2: [
    { id: "c12", seriesId: "s2", number: 1, title: "Gilded Letters", releaseDateIso: "2026-05-12", status: "Free", isLocked: false },
    { id: "c13", seriesId: "s2", number: 2, title: "Ash Kisses", releaseDateIso: "2026-05-22", status: "Free", isLocked: false }
  ]
};

export const chaptersBySeries: Record<string, Chapter[]> = {};

seriesList.forEach((series) => {
  const existing = initialChaptersBySeries[series.id];
  if (existing) {
    chaptersBySeries[series.id] = existing;
    return;
  }

  const list: Chapter[] = [];
  for (let i = 1; i <= series.chapterCount; i++) {
    const dayOffset = i * 5;
    const releaseDate = new Date("2026-05-01");
    releaseDate.setDate(releaseDate.getDate() + dayOffset);
    const dateStr = releaseDate.toISOString().split("T")[0]!;

    list.push({
      id: `c_${series.id}_ch${i}`,
      seriesId: series.id,
      number: i,
      title: `${series.title.split(":")[0]} Chapter ${i}`,
      releaseDateIso: dateStr,
      status: "Free",
      isLocked: false
    });
  }
  chaptersBySeries[series.id] = list;
});

export function buildMockPages(chapterId: string): ChapterPage[] {
  const palettes = {
    c1: ["#7C3AED", "#2A145D", "#F59E0B"],
    c2: ["#7C3AED", "#111111", "#F59E0B"],
    c3: ["#7C3AED", "#EF4444", "#111111"],
    c4: ["#7C3AED", "#F59E0B", "#EF4444"],
    c12: ["#F59E0B", "#7C3AED", "#111111"],
    c13: ["#F59E0B", "#EF4444", "#111111"],
    c30: ["#FF4F7B", "#7C3AED", "#F59E0B"],
    c31: ["#FF4F7B", "#111111", "#00E5FF"],
    c40: ["#7F1D1D", "#111111", "#EF4444"],
    c41: ["#7F1D1D", "#2A145D", "#111111"],
    c50: ["#00A8C8", "#102033", "#7C3AED"],
    c51: ["#00A8C8", "#111111", "#F59E0B"]
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

export const mockAuthors: Author[] = [
  {
    id: "a1",
    name: "Sanjay V.",
    bio: "Sanjay V. is a veteran cyber-author from Neo-Delhi specializing in gritty street-level hacker fiction, neon worldbuilding, and AI integration systems.",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Sanjay",
    followerCount: 1250,
    isTopAuthor: true
  },
  {
    id: "a2",
    name: "Rupa D.",
    bio: "Rupa D. crafts grand mechanical fantasy and dragon-drive steampunks. Champion of rune-smith folklore and antique mechanical designs.",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Rupa",
    followerCount: 3400,
    isTopAuthor: true
  },
  {
    id: "a3",
    name: "S. Rava",
    bio: "S. Rava lives and breathes high-stakes action scenes, rooftop snipers, and high-altitude chases. Perfecting the fast-paced cinematic comic medium.",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Rava",
    followerCount: 890,
    isTopAuthor: false
  },
  {
    id: "a4",
    name: "N. Kade",
    bio: "N. Kade is a dimension-hopping cartographer who writes speculative quantum fiction where pages and rooms actively rewrite themselves.",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Kade",
    followerCount: 2200,
    isTopAuthor: true
  },
  {
    id: "a5",
    name: "Mira K.",
    bio: "Mira K. writes high-speed tech-romance where pilots trade encrypted logs and racing hearts. Combining romantic tension with sleek hovercraft races.",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Mira",
    followerCount: 1540,
    isTopAuthor: true
  },
  {
    id: "a6",
    name: "A. Varun",
    bio: "A. Varun curates deep late-night cosmic horror signals. Explores missing frequencies, phantom dial-ins, and radio-wave nightmares.",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Varun",
    followerCount: 930,
    isTopAuthor: false
  },
  {
    id: "a7",
    name: "I. Sen",
    bio: "I. Sen is an architecture-sleuth crafting mirror-room whodunits, glass labyrinth secrets, and clues hidden inside absolute reflections.",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Sen",
    followerCount: 1110,
    isTopAuthor: false
  }
];

export function getAuthorId(writerName: string): string {
  if (!writerName) return "a1";
  const name = writerName.trim().toLowerCase();
  const author = mockAuthors.find((a) => a.name.toLowerCase() === name);
  return author ? author.id : "a1";
}

export function isTopAuthor(writerNameOrId?: string): boolean {
  if (!writerNameOrId) return false;
  const target = writerNameOrId.trim().toLowerCase();
  const author = mockAuthors.find(
    (a) => a.id.toLowerCase() === target || a.name.toLowerCase() === target
  );
  return author?.isTopAuthor ?? false;
}
