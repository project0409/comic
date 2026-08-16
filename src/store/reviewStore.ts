import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Review = {
  id: string;
  seriesId: string;
  userEmail: string;
  userName: string;
  rating: number; // 1 to 5
  reviewText: string;
  atIso: string;
};

type ReviewState = {
  reviews: Review[];
  addOrUpdateReview: (review: Omit<Review, "id" | "atIso">) => void;
};

export const useReviewStore = create<ReviewState>()(
  persist(
    (set) => ({
      reviews: [
        // Pre-seeded mock reviews for series s1 ("Cyberpunk Odyssey: Neo-Zenith")
        {
          id: "r1",
          seriesId: "s1",
          userEmail: "cyber_read@example.com",
          userName: "Aki_Net",
          rating: 5,
          reviewText: "Absolutely stunning visual style! The dynamic lighting in the canvas reader really pulls you into the cyberpunk atmosphere.",
          atIso: "2026-08-01T14:22:00Z"
        },
        {
          id: "r2",
          seriesId: "s1",
          userEmail: "retro_lover@example.com",
          userName: "RetroGamer",
          rating: 5,
          reviewText: "The panel layouts and transitions are masterclass. Sanjay V. outdid themselves here. Highly recommended!",
          atIso: "2026-08-05T09:12:00Z"
        },
        {
          id: "r3",
          seriesId: "s1",
          userEmail: "neoz_fan@example.com",
          userName: "NeoZenithian",
          rating: 4,
          reviewText: "Great story and world-building! Docked one star because the early access chapters cost a bit too many coins, but the reading experience is top notch.",
          atIso: "2026-08-10T18:45:00Z"
        },
        {
          id: "r4",
          seriesId: "s1",
          userEmail: "casual_reader@example.com",
          userName: "Mona_L",
          rating: 3,
          reviewText: "Decent plot, but a bit confusing in the first chapter. Guided panel zoom helps, but it could use more action sequences early on.",
          atIso: "2026-08-12T11:30:00Z"
        },
        {
          id: "r_s1_5",
          seriesId: "s1",
          userEmail: "critic@example.com",
          userName: "ComicCritic",
          rating: 2,
          reviewText: "The art style is great but the writing feels cliché. Just another generic cyberpunk story about rogue hackers against corporation overlords.",
          atIso: "2026-08-14T08:15:00Z"
        },
        // Pre-seeded mock reviews for series s2 ("Shadow of the Dragon")
        {
          id: "r5",
          seriesId: "s2",
          userEmail: "steampunk_steve@example.com",
          userName: "Steve_F",
          rating: 5,
          reviewText: "Biological dragon-drives?! That's the most original fantasy-steampunk crossover concept I've read in years.",
          atIso: "2026-08-02T16:40:00Z"
        },
        {
          id: "r6",
          seriesId: "s2",
          userEmail: "fantasy_queen@example.com",
          userName: "RunicRuler",
          rating: 4,
          reviewText: "Amazing iron smith lore. Rupa D. constructs a really vivid setting. Excited for chapter 3!",
          atIso: "2026-08-07T21:10:00Z"
        },
        // Pre-seeded mock reviews for series s3 ("Night City Blade")
        {
          id: "r7",
          seriesId: "s3",
          userEmail: "action_fanatic@example.com",
          userName: "TriggerFinger",
          rating: 4,
          reviewText: "A fast-paced gritty action comic. The sniper fight on the rooftop is so well pacing-directed.",
          atIso: "2026-08-03T10:05:00Z"
        },
        {
          id: "r8",
          seriesId: "s3",
          userEmail: "blade_runner@example.com",
          userName: "KatanaX",
          rating: 5,
          reviewText: "Love the neo-noir aesthetics and music sync in this. A total blast!",
          atIso: "2026-08-09T23:50:00Z"
        }
      ],
      addOrUpdateReview: (reviewData) =>
        set((state) => {
          const existingIdx = state.reviews.findIndex(
            (r) => r.seriesId === reviewData.seriesId && r.userEmail === reviewData.userEmail
          );
          
          if (existingIdx > -1) {
            const updated = [...state.reviews];
            updated[existingIdx] = {
              ...updated[existingIdx]!,
              rating: reviewData.rating,
              reviewText: reviewData.reviewText,
              userName: reviewData.userName,
              atIso: new Date().toISOString()
            };
            return { reviews: updated };
          } else {
            const newReview: Review = {
              id: `rev_${crypto.randomUUID()}`,
              atIso: new Date().toISOString(),
              ...reviewData
            };
            return { reviews: [newReview, ...state.reviews] };
          }
        })
    }),
    {
      name: "fyp-comic-reviews"
    }
  )
);
