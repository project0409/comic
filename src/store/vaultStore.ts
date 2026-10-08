import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "./authStore";

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
  emoji: "🔥" | "❤️" | "😭" | "🤯" | "💀" | "👏" | "⚡" | "✨";
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

export type VaultHistoryItem = {
  seriesId: string;
  chapterId: string;
  readAtIso: string;
};

type VaultState = {
  bookmarks: VaultBookmark[];
  reactions: VaultReaction[];
  highlights: VaultHighlight[];
  collections: VaultCollection[];
  history: VaultHistoryItem[];
  addBookmark: (b: Omit<VaultBookmark, "id">) => string;
  updateBookmarkNote: (id: string, note: string) => void;
  addReaction: (r: Omit<VaultReaction, "id" | "atIso">) => void;
  removeBookmarkBySeries: (seriesName: string) => void;
  deleteBookmark: (id: string) => void;
  createCollection: (name: string) => string | undefined;
  renameCollection: (collectionId: string, name: string) => void;
  deleteCollection: (collectionId: string) => void;
  addBookmarkToCollection: (collectionId: string, bookmarkId: string) => void;
  removeBookmarkFromCollection: (collectionId: string, bookmarkId: string) => void;
  addHistory: (seriesId: string, chapterId: string) => void;
  clearHistory: () => void;
};

export const useVaultStore = create<VaultState>()(
  persist(
    (set) => ({
      bookmarks: [
        {
          id: "bm_s3_c1",
          seriesName: "Night City Blade",
          chapterId: "c_s3_ch1",
          pageIndex: 1,
          x: 200,
          y: 350,
          note: "Alley ambush standoff"
        },
        {
          id: "bm_s3_c2",
          seriesName: "Night City Blade",
          chapterId: "c_s3_ch2",
          pageIndex: 2,
          x: 310,
          y: 420,
          note: "Syndicate Boss hologram"
        },
        {
          id: "bm_s3_c3",
          seriesName: "Night City Blade",
          chapterId: "c_s3_ch3",
          pageIndex: 3,
          x: 180,
          y: 290,
          note: "Rooftop sniper vantage"
        },
        {
          id: "bm_s3_c4",
          seriesName: "Night City Blade",
          chapterId: "c_s3_ch4",
          pageIndex: 4,
          x: 250,
          y: 380,
          note: "Neon vows cliffhanger"
        }
      ],
      reactions: [
        { id: "rx_s3_1", emoji: "🔥", seriesName: "Night City Blade", chapterId: "c_s3_ch1", pageIndex: 1, x: 120, y: 200, atIso: "2026-05-02T12:00:00Z" },
        { id: "rx_s3_2", emoji: "👏", seriesName: "Night City Blade", chapterId: "c_s3_ch1", pageIndex: 2, x: 220, y: 310, atIso: "2026-05-02T14:30:00Z" },
        { id: "rx_s3_3", emoji: "🤯", seriesName: "Night City Blade", chapterId: "c_s3_ch2", pageIndex: 2, x: 180, y: 400, atIso: "2026-05-09T17:15:00Z" },
        { id: "rx_s3_4", emoji: "🔥", seriesName: "Night City Blade", chapterId: "c_s3_ch3", pageIndex: 3, x: 150, y: 220, atIso: "2026-05-16T11:45:00Z" },
        { id: "rx_s3_5", emoji: "💀", seriesName: "Night City Blade", chapterId: "c_s3_ch3", pageIndex: 4, x: 280, y: 360, atIso: "2026-05-16T15:20:00Z" },
        { id: "rx_s3_6", emoji: "🔥", seriesName: "Night City Blade", chapterId: "c_s3_ch4", pageIndex: 4, x: 300, y: 450, atIso: "2026-05-23T22:10:00Z" },
        { id: "rx_s3_7", emoji: "😭", seriesName: "Night City Blade", chapterId: "c_s3_ch4", pageIndex: 4, x: 160, y: 280, atIso: "2026-05-23T23:05:00Z" }
      ],
      history: [
        { seriesId: "s3", chapterId: "c_s3_ch1", readAtIso: "2026-05-02T10:00:00Z" },
        { seriesId: "s3", chapterId: "c_s3_ch2", readAtIso: "2026-05-09T11:00:00Z" },
        { seriesId: "s3", chapterId: "c_s3_ch3", readAtIso: "2026-05-16T12:00:00Z" },
        { seriesId: "s3", chapterId: "c_s3_ch4", readAtIso: "2026-05-23T14:00:00Z" }
      ],
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
        if (!useAuthStore.getState().isAuthenticated) return "";
        const id = `bm_${crypto.randomUUID()}`;
        set((s) => ({
          bookmarks: [{ id, ...b }, ...s.bookmarks]
        }));
        return id;
      },
      updateBookmarkNote: (id, note) => {
        if (!useAuthStore.getState().isAuthenticated) return;
        set((s) => ({
          bookmarks: s.bookmarks.map((b) => (b.id === id ? { ...b, note } : b))
        }));
      },
      addReaction: (r) => {
        if (!useAuthStore.getState().isAuthenticated) return;
        set((s) => ({
          reactions: [
            { id: `rx_${crypto.randomUUID()}`, atIso: new Date().toISOString(), ...r },
            ...s.reactions
          ]
        }));
      },
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
      deleteBookmark: (id) =>
        set((s) => ({
          bookmarks: s.bookmarks.filter((b) => b.id !== id),
          collections: s.collections.map((collection) => ({
            ...collection,
            bookmarkIds: collection.bookmarkIds.filter((bId) => bId !== id)
          }))
        })),
      createCollection: (name) => {
        if (!useAuthStore.getState().isAuthenticated) return undefined;
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
      renameCollection: (collectionId, name) => {
        if (!useAuthStore.getState().isAuthenticated) return;
        set((s) => {
          const cleanName = name.trim();
          if (!cleanName) return s;
          return {
            collections: s.collections.map((collection) =>
              collection.id === collectionId ? { ...collection, name: cleanName } : collection
            )
          };
        });
      },
      deleteCollection: (collectionId) => {
        if (!useAuthStore.getState().isAuthenticated) return;
        set((s) => ({
          collections: s.collections.filter((collection) => collection.id !== collectionId)
        }));
      },
      addBookmarkToCollection: (collectionId, bookmarkId) => {
        if (!useAuthStore.getState().isAuthenticated) return;
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
        }));
      },
      removeBookmarkFromCollection: (collectionId, bookmarkId) =>
        set((s) => ({
          collections: s.collections.map((collection) =>
            collection.id === collectionId
              ? { ...collection, bookmarkIds: collection.bookmarkIds.filter((id) => id !== bookmarkId) }
              : collection
          )
        })),
      addHistory: (seriesId, chapterId) =>
        set((s) => {
          const cleanHistory = s.history.filter((item) => item.seriesId !== seriesId);
          const newItem: VaultHistoryItem = {
            seriesId,
            chapterId,
            readAtIso: new Date().toISOString()
          };
          return {
            history: [newItem, ...cleanHistory].slice(0, 15)
          };
        }),
      clearHistory: () => set({ history: [] })
    }),
    {
      name: "fyp-user-vault-store-persisted"
    }
  )
);
