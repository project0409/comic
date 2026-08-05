import { create } from "zustand";

export type VaultBookmark = {
  id: string;
  seriesName: string;
  chapterId: string;
  pageIndex: number;
  x: number;
  y: number;
  note?: string;
  thumbUrl?: string;
};

export type VaultReaction = {
  id: string;
  emoji: "🔥" | "😭" | "🤯" | "💀" | "👏";
  seriesName: string;
  chapterId: string;
  pageIndex: number;
  x: number;
  y: number;
  comment?: string;
  atIso: string;
};

export type VaultHighlight = {
  id: string;
  quote: string;
  chapterId: string;
  context?: string;
  atIso: string;
};

type VaultState = {
  bookmarks: VaultBookmark[];
  reactions: VaultReaction[];
  highlights: VaultHighlight[];
  addBookmark: (b: Omit<VaultBookmark, "id">) => void;
  updateBookmarkNote: (id: string, note: string) => void;
  addReaction: (r: Omit<VaultReaction, "id" | "atIso">) => void;
  removeBookmarkBySeries: (seriesName: string) => void;
};

export const useVaultStore = create<VaultState>((set) => ({
  bookmarks: [],
  reactions: [],
  highlights: [
    {
      id: "hl_1",
      quote: "Where reading meets cinema.",
      chapterId: "c1",
      context: "FYP tagline",
      atIso: new Date().toISOString()
    }
  ],
  addBookmark: (b) =>
    set((s) => ({
      bookmarks: [{ id: `bm_${crypto.randomUUID()}`, ...b }, ...s.bookmarks]
    })),
  updateBookmarkNote: (id, note) =>
    set((s) => ({
      bookmarks: s.bookmarks.map((b) => (b.id === id ? { ...b, note } : b))
    })),
  addReaction: (r) =>
    set((s) => ({
      reactions: [
        { id: `rx_${crypto.randomUUID()}`, atIso: new Date().toISOString(), ...r },
        ...s.reactions
      ]
    })),
  removeBookmarkBySeries: (seriesName) =>
    set((s) => ({
      bookmarks: s.bookmarks.filter((b) => b.seriesName !== seriesName)
    }))
}));
