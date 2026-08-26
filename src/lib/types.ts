export type Series = {
  id: string;
  title: string;
  writerName: string;
  genre: string;
  chapterCount: number;
  readers: number;
  rating: number;
  description: string;
  searchKeywords?: string[];
  isLocked: boolean;
  earlyAccessPriceCoins?: number;
  coverUrl: string; // ok to use <img>/bg-image outside reader
  ambientColorHex: string;
};

export type ReleaseCalendarItem = {
  id: string;
  title: string;
  genre: string;
  subgenre: string;
  releaseDateLabel: string;
  status: "ComingSoon" | "InQueue";
  writerName?: string;
};

export type Chapter = {
  id: string;
  seriesId: string;
  number: number;
  title: string;
  releaseDateIso: string;
  status: "Free" | "Coins" | "ComingSoon";
  coinPrice?: number;
  isLocked: boolean;
};

export type PagePanelCoord = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type ChapterPage = {
  id: string;
  index: number; // 1-indexed
  imageUrl: string;
  audioUrl?: string;
  mood?: "Suspense" | "Action" | "Romantic";
  ambientColorHex: string;
  panelCoordinates: PagePanelCoord[];
};

export type Author = {
  id: string;
  name: string;
  avatarUrl: string;
  bio: string;
  followerCount: number;
};
