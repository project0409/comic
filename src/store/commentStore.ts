import { create } from "zustand";

export type ChapterComment = {
  id: string;
  targetType: "Comic" | "Chapter";
  seriesId?: string;
  seriesName: string;
  chapterId?: string;
  pageIndex?: number;
  readerName: string;
  body: string;
  atIso: string;
  status: "New" | "Reviewed";
};

type CommentState = {
  comments: ChapterComment[];
  addComment: (comment: Omit<ChapterComment, "id" | "atIso" | "status">) => void;
  markReviewed: (id: string) => void;
};

export const useCommentStore = create<CommentState>((set) => ({
  comments: [
    {
      id: "cm_demo_1",
      targetType: "Chapter",
      seriesId: "s3",
      seriesName: "Night City Blade",
      chapterId: "c2",
      pageIndex: 2,
      readerName: "Demo Reader",
      body: "The rooftop sniper scene is intense. I want more backstory for the blade-for-hire.",
      atIso: new Date().toISOString(),
      status: "New"
    }
  ],
  addComment: (comment) =>
    set((state) => ({
      comments: [
        {
          id: `cm_${crypto.randomUUID()}`,
          atIso: new Date().toISOString(),
          status: "New",
          ...comment
        },
        ...state.comments
      ]
    })),
  markReviewed: (id) =>
    set((state) => ({
      comments: state.comments.map((comment) =>
        comment.id === id ? { ...comment, status: "Reviewed" } : comment
      )
    }))
}));
