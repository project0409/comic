"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthorState {
  followedAuthorIds: string[];
  toggleFollow: (authorId: string) => void;
  isFollowing: (authorId: string) => boolean;
}

export const useAuthorStore = create<AuthorState>()(
  persist(
    (set, get) => ({
      followedAuthorIds: [],
      toggleFollow: (authorId: string) => {
        set((state) => {
          const isCurrentlyFollowing = state.followedAuthorIds.includes(authorId);
          const nextIds = isCurrentlyFollowing
            ? state.followedAuthorIds.filter((id) => id !== authorId)
            : [...state.followedAuthorIds, authorId];
          return { followedAuthorIds: nextIds };
        });
      },
      isFollowing: (authorId: string) => {
        return get().followedAuthorIds.includes(authorId);
      }
    }),
    {
      name: "fyp-user-followed-authors"
    }
  )
);
