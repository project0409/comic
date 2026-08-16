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

export type VaultCollection = {
  id: string;
  name: string;
  bookmarkIds: string[];
  createdAtIso: string;
};

type VaultState = {
  bookmarks: VaultBookmark[];
  reactions: VaultReaction[];
  highlights: VaultHighlight[];
  collections: VaultCollection[];
  addBookmark: (b: Omit<VaultBookmark, "id">) => string;
  updateBookmarkNote: (id: string, note: string) => void;
  addReaction: (r: Omit<VaultReaction, "id" | "atIso">) => void;
  removeBookmarkBySeries: (seriesName: string) => void;
  createCollection: (name: string) => string | undefined;
  renameCollection: (collectionId: string, name: string) => void;
  deleteCollection: (collectionId: string) => void;
  addBookmarkToCollection: (collectionId: string, bookmarkId: string) => void;
  removeBookmarkFromCollection: (collectionId: string, bookmarkId: string) => void;
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
  collections: [],
  addBookmark: (b) => {
    const id = `bm_${crypto.randomUUID()}`;
    set((s) => ({
      bookmarks: [{ id, ...b }, ...s.bookmarks]
    }));
    return id;
  },
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
      bookmarks: s.bookmarks.filter((b) => b.seriesName !== seriesName),
      collections: s.collections.map((collection) => ({
        ...collection,
        bookmarkIds: collection.bookmarkIds.filter((id) =>
          s.bookmarks.some((bookmark) => bookmark.id === id && bookmark.seriesName !== seriesName)
        )
      }))
    })),
  createCollection: (name) => {
    const cleanName = name.trim();
    if (!cleanName) return undefined;
    const id = `col_${crypto.randomUUID()}`;
    set((s) => ({
      collections: [
        {
          id,
          name: cleanName,
          bookmarkIds: [],
          createdAtIso: new Date().toISOString()
        },
        ...s.collections
      ]
    }));
    return id;
  },
  renameCollection: (collectionId, name) =>
    set((s) => {
      const cleanName = name.trim();
      if (!cleanName) return s;
      return {
        collections: s.collections.map((collection) =>
          collection.id === collectionId ? { ...collection, name: cleanName } : collection
        )
      };
    }),
  deleteCollection: (collectionId) =>
    set((s) => ({
      collections: s.collections.filter((collection) => collection.id !== collectionId)
    })),
  addBookmarkToCollection: (collectionId, bookmarkId) =>
    set((s) => ({
      collections: s.collections.map((collection) =>
        collection.id === collectionId
          ? {
              ...collection,
              bookmarkIds: collection.bookmarkIds.includes(bookmarkId)
                ? collection.bookmarkIds
                : [bookmarkId, ...collection.bookmarkIds]
            }
          : collection
      )
    })),
  removeBookmarkFromCollection: (collectionId, bookmarkId) =>
    set((s) => ({
      collections: s.collections.map((collection) =>
        collection.id === collectionId
          ? { ...collection, bookmarkIds: collection.bookmarkIds.filter((id) => id !== bookmarkId) }
          : collection
      )
    }))
}));
