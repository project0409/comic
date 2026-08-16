import { create } from "zustand";

type OnboardingState = {
  isTourActive: boolean;
  currentStep: number;
  showWelcomeModal: boolean;
  showCompletionModal: boolean;
  set: (state: Partial<OnboardingState> | ((state: OnboardingState) => Partial<OnboardingState>)) => void;
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  isTourActive: false,
  currentStep: 0,
  showWelcomeModal: false,
  showCompletionModal: false,
  set: (nextState) =>
    set((state) => {
      const resolved = typeof nextState === "function" ? nextState(state) : nextState;
      return { ...state, ...resolved };
    }),
}));
