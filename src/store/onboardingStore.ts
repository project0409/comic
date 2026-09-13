import { create } from "zustand";
import type { TourType } from "@/lib/tours";

type OnboardingState = {
  isTourActive: boolean;
  currentStep: number;
  activeTourType: TourType;
  showWelcomeModal: boolean;
  showCompletionModal: boolean;
  startTour: (tourType?: TourType) => void;
  set: (state: Partial<OnboardingState> | ((state: OnboardingState) => Partial<OnboardingState>)) => void;
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  isTourActive: false,
  currentStep: 0,
  activeTourType: "home",
  showWelcomeModal: false,
  showCompletionModal: false,
  startTour: (tourType = "home") =>
    set({
      activeTourType: tourType,
      isTourActive: true,
      currentStep: 0,
      showWelcomeModal: false,
      showCompletionModal: false,
    }),
  set: (nextState) =>
    set((state) => {
      const resolved = typeof nextState === "function" ? nextState(state) : nextState;
      return { ...state, ...resolved };
    }),
}));
