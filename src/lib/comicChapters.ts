export interface ComicPageItem {
  pageNumber: number; // 1-indexed
  imageUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  ambientColorHex?: string;
  mood?: "Action" | "Suspense" | "Romantic";
}

export interface ComicChapterItem {
  id: string; // e.g. "c1", "chapter-1"
  seriesId: string;
  number: number;
  title: string;
  displayTitle: string; // e.g. "Chapter 1 — The Beginning"
  subtitle: string;
  description: string;
  status: "Free" | "Locked" | "ComingSoon";
  pages: ComicPageItem[];
}

export const COMIC_CHAPTERS: ComicChapterItem[] = [
  {
    id: "c1",
    seriesId: "s1",
    number: 1,
    title: "The Beginning",
    displayTitle: "Chapter 1 — The Beginning",
    subtitle: "Awakening in Neo-Zenith",
    description: "Deep in the neon sprawl, a rogue hacker awakens with an encrypted shard holding humanity's lost truth.",
    status: "Free",
    pages: [
      {
        pageNumber: 1,
        imageUrl: "/chapters/chapter-1/page-1.svg",
        caption: "Act I: The Awakening",
        ambientColorHex: "#7C3AED",
        mood: "Suspense"
      },
      {
        pageNumber: 2,
        imageUrl: "/chapters/chapter-1/page-2.svg",
        caption: "Terminal Decrypt",
        ambientColorHex: "#2A145D",
        mood: "Suspense"
      },
      {
        pageNumber: 3,
        imageUrl: "/chapters/chapter-1/page-3.svg",
        caption: "Contact in the Steam",
        ambientColorHex: "#00E5FF",
        mood: "Action"
      },
      {
        pageNumber: 4,
        imageUrl: "/chapters/chapter-1/page-4.svg",
        caption: "The Rooftop Plunge",
        ambientColorHex: "#7C3AED",
        mood: "Action"
      }
    ]
  },
  {
    id: "c2",
    seriesId: "s1",
    number: 2,
    title: "The Journey",
    displayTitle: "Chapter 2 — The Journey",
    subtitle: "Crossing the Spirelands",
    description: "A high-speed transit train carries the shard into the Spirelands under heavy sentry pursuit.",
    status: "Free",
    pages: [
      {
        pageNumber: 1,
        imageUrl: "/chapters/chapter-2/page-1.svg",
        caption: "Act II: The Crossing",
        ambientColorHex: "#F59E0B",
        mood: "Suspense"
      },
      {
        pageNumber: 2,
        imageUrl: "/chapters/chapter-2/page-2.svg",
        caption: "Ambush on Rails",
        ambientColorHex: "#EF4444",
        mood: "Action"
      },
      {
        pageNumber: 3,
        imageUrl: "/chapters/chapter-2/page-3.svg",
        caption: "The Cloud Barrier",
        ambientColorHex: "#F59E0B",
        mood: "Action"
      },
      {
        pageNumber: 4,
        imageUrl: "/chapters/chapter-2/page-4.svg",
        caption: "Safe Harbor at Last",
        ambientColorHex: "#111827",
        mood: "Romantic"
      }
    ]
  },
  {
    id: "c3",
    seriesId: "s1",
    number: 3,
    title: "The Mystery",
    displayTitle: "Chapter 3 — The Mystery",
    subtitle: "The Ancient Vault",
    description: "Beneath the bedrock lies the forgotten AI archivist, holding answers to the world's ruined atmosphere.",
    status: "Free",
    pages: [
      {
        pageNumber: 1,
        imageUrl: "/chapters/chapter-3/page-1.svg",
        caption: "Act III: The Ancient Vault",
        ambientColorHex: "#00E5FF",
        mood: "Suspense"
      },
      {
        pageNumber: 2,
        imageUrl: "/chapters/chapter-3/page-2.svg",
        caption: "The Archivist Awakens",
        ambientColorHex: "#10B981",
        mood: "Suspense"
      },
      {
        pageNumber: 3,
        imageUrl: "/chapters/chapter-3/page-3.svg",
        caption: "Forgotten Earth Memories",
        ambientColorHex: "#00E5FF",
        mood: "Romantic"
      },
      {
        pageNumber: 4,
        imageUrl: "/chapters/chapter-3/page-4.svg",
        caption: "The Quantum Seed",
        ambientColorHex: "#7C3AED",
        mood: "Action"
      }
    ]
  },
  {
    id: "c4",
    seriesId: "s1",
    number: 4,
    title: "The Final Battle",
    displayTitle: "Chapter 4 — The Final Battle",
    subtitle: "Climax: Siege of the Apex",
    description: "Eighty thousand feet above the earth, syndicate flagships collide in the final struggle for tomorrow.",
    status: "Free",
    pages: [
      {
        pageNumber: 1,
        imageUrl: "/chapters/chapter-4/page-1.svg",
        caption: "Climax: Siege of the Apex",
        ambientColorHex: "#FF3366",
        mood: "Action"
      },
      {
        pageNumber: 2,
        imageUrl: "/chapters/chapter-4/page-2.svg",
        caption: "Duel of Legends",
        ambientColorHex: "#EF4444",
        mood: "Action"
      },
      {
        pageNumber: 3,
        imageUrl: "/chapters/chapter-4/page-3.svg",
        caption: "The Catalyst Burst",
        ambientColorHex: "#FFC107",
        mood: "Action"
      },
      {
        pageNumber: 4,
        imageUrl: "/chapters/chapter-4/page-4.svg",
        caption: "Dawn of a New World",
        ambientColorHex: "#10B981",
        mood: "Action"
      }
    ]
  }
];

// Normalize chapter ID lookup
export function getComicChapter(chapterId: string): ComicChapterItem {
  // Direct ID lookup (e.g. "c1", "c2", "chapter-1")
  const found = COMIC_CHAPTERS.find(
    (c) => c.id === chapterId || `chapter-${c.number}` === chapterId || `c${c.number}` === chapterId
  );
  if (found) return found;

  // Fallback: create dynamic fallback chapter with pages
  const numberMatch = chapterId.match(/\d+/);
  const num = numberMatch ? parseInt(numberMatch[0], 10) : 1;
  const wrappedIndex = ((num - 1) % COMIC_CHAPTERS.length);
  const template = COMIC_CHAPTERS[wrappedIndex] || COMIC_CHAPTERS[0];

  return {
    ...template,
    id: chapterId,
    number: num,
    title: `${template.title}`,
    displayTitle: `Chapter ${num} — ${template.title}`,
    pages: template.pages.map((p) => ({
      ...p,
      imageUrl: p.imageUrl
    }))
  };
}

export function getAllComicChapters(seriesId?: string): ComicChapterItem[] {
  if (!seriesId) return COMIC_CHAPTERS;
  return COMIC_CHAPTERS.filter((c) => c.seriesId === seriesId);
}

export function getNextChapter(currentChapterId: string): ComicChapterItem | null {
  const current = getComicChapter(currentChapterId);
  const next = COMIC_CHAPTERS.find((c) => c.number === current.number + 1);
  return next ?? null;
}

export function getPrevChapter(currentChapterId: string): ComicChapterItem | null {
  const current = getComicChapter(currentChapterId);
  const prev = COMIC_CHAPTERS.find((c) => c.number === current.number - 1);
  return prev ?? null;
}
