import { create } from "zustand";
import { persist } from "zustand/middleware";

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

export const useCommentStore = create<CommentState>()(
  persist(
    (set) => ({
      comments: [
        {
          id: "cm_s1_c1",
          targetType: "Chapter",
          seriesId: "s1",
          seriesName: "Cyberpunk Odyssey: Neo-Zenith",
          chapterId: "c1",
          pageIndex: 1,
          readerName: "Aki_Net",
          body: "The neural jack effect in page 1 looks sick! Love the color palette.",
          atIso: "2026-08-02T10:20:00Z",
          status: "New"
        },
        {
          id: "cm_s1_c2",
          targetType: "Chapter",
          seriesId: "s1",
          seriesName: "Cyberpunk Odyssey: Neo-Zenith",
          chapterId: "c2",
          pageIndex: 2,
          readerName: "RetroGamer",
          body: "That drone chase transition was top tier. Can't wait for Chapter 3!",
          atIso: "2026-08-06T15:25:00Z",
          status: "New"
        },
        {
          id: "cm_s1_c3",
          targetType: "Chapter",
          seriesId: "s1",
          seriesName: "Cyberpunk Odyssey: Neo-Zenith",
          chapterId: "c3",
          pageIndex: 1,
          readerName: "NeoZenithian",
          body: "Ghost Circuit answered so many questions about the neural core. Incredible!",
          atIso: "2026-08-11T19:05:00Z",
          status: "New"
        },
        {
          id: "cm_s3_c1_1",
          targetType: "Chapter",
          seriesId: "s3",
          seriesName: "Night City Blade",
          chapterId: "c_s3_ch1",
          pageIndex: 1,
          readerName: "Aki_Net",
          body: "The opening rain sequence and alley duel set such a gritty tone. Loving S. Rava's choreography!",
          atIso: "2026-05-02T10:15:00Z",
          status: "New"
        },
        {
          id: "cm_s3_c1_2",
          targetType: "Chapter",
          seriesId: "s3",
          seriesName: "Night City Blade",
          chapterId: "c_s3_ch1",
          pageIndex: 2,
          readerName: "BladeMaster",
          body: "The blade deflection sound effects worked so well in the canvas reader. Great start!",
          atIso: "2026-05-03T18:40:00Z",
          status: "Reviewed"
        },
        {
          id: "cm_s3_c2_1",
          targetType: "Chapter",
          seriesId: "s3",
          seriesName: "Night City Blade",
          chapterId: "c_s3_ch2",
          pageIndex: 2,
          readerName: "TriggerFinger",
          body: "The neon syndicate boss intro gave me chills. Fantastic cyberpunk character design!",
          atIso: "2026-05-09T14:15:00Z",
          status: "New"
        },
        {
          id: "cm_s3_c3_1",
          targetType: "Chapter",
          seriesId: "s3",
          seriesName: "Night City Blade",
          chapterId: "c_s3_ch3",
          pageIndex: 3,
          readerName: "SniperScope",
          body: "Rooftop vantage points and dynamic lighting are incredible. The tension had me sweating!",
          atIso: "2026-05-16T09:20:00Z",
          status: "New"
        },
        {
          id: "cm_s3_c4_1",
          targetType: "Chapter",
          seriesId: "s3",
          seriesName: "Night City Blade",
          chapterId: "c_s3_ch4",
          pageIndex: 4,
          readerName: "KatanaX",
          body: "Neon vows cliffhanger was epic! Can't wait for Chapter 5.",
          atIso: "2026-05-23T20:30:00Z",
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
    }),
    {
      name: "fyp-chapter-comments-v2"
    }
  )
);
