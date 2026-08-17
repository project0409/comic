"use client";

import React, { useEffect, useState } from "react";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useAuthStore } from "@/store/authStore";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, HelpCircle, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/Button";
import { GuideMascot } from "./GuideMascot";

// Define the steps of the onboarding website tour
const TOUR_STEPS = [
  {
    target: "#tour-navbar",
    title: "Navigation Bar",
    content: "Explore the platform using these navigation links. Jump back to the Home feed, discover new titles, view all series, or open your Vault.",
  },
  {
    target: "#tour-search-bar",
    title: "Search Bar",
    content: "Looking for something specific? Search for your favorite comic series, writers, or tags instantly.",
  },
  {
    target: "#tour-genres",
    title: "Categories & Genres",
    content: "Filter comics by genre! Click on Action, Fantasy, Sci-Fi, Romance, or Horror to find exactly what you like.",
  },
  {
    target: ".sf-comic-card",
    title: "Comic Cards",
    content: "Explore our rich catalog. Each card shows the series title, chapter count, and custom genre badges.",
  },
  {
    target: ".sf-comic-card",
    title: "How to Open a Comic",
    content: "Click on any comic card to view details, chapters, read reviews, and start reading your favorite episodes.",
  },
  {
    target: ".sf-comic-card",
    title: "Immersive Reader Controls",
    content: "Inside the reader, you can switch between vertical scroll or panel-by-panel modes, adjust zoom, and toggle ambient music.",
  },
  {
    target: "#tour-reader-hub",
    title: "Bookmarks & Saved Stories",
    content: "Keep track of your reading progress! Access your bookmarks and favorite series inside the Reader Hub.",
  },
  {
    target: "#tour-profile-menu",
    title: "Profile Section",
    content: "Manage your user profile. Open this menu to view details, check your email, or check out dashboard tools if you are a creator.",
  },
  {
    target: "#tour-profile-menu",
    title: "Settings Section",
    content: "Inside the profile dropdown, you'll find the Settings option to edit credentials, change names, and manage account preferences.",
  },
  {
    target: "#tour-theme-toggle",
    title: "Theme Switcher",
    content: "Prefer a dark UI or comfortable reading at night? Switch between Dark, Light, or System themes instantly.",
  }
];

export function OnboardingTour() {
  const { isTourActive, currentStep, showWelcomeModal, showCompletionModal, set } = useOnboardingStore();
  const { isAuthenticated, email } = useAuthStore();
  
  const [domReady, setDomReady] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);

  // 1. Verify that all target elements are ready in DOM before starting
  useEffect(() => {
    if (!isAuthenticated || !email) {
      setDomReady(false);
      return;
    }

    const checkDomReady = () => {
      const required = [
        "#tour-navbar",
        "#tour-search-bar",
        "#tour-genres",
        ".sf-comic-card",
        "#tour-reader-hub",
        "#tour-profile-menu",
        "#tour-theme-toggle"
      ];
      // All elements must exist in the DOM
      return required.every((sel) => document.querySelector(sel) !== null);
    };

    if (checkDomReady()) {
      setDomReady(true);
      return;
    }

    const interval = setInterval(() => {
      if (checkDomReady()) {
        setDomReady(true);
        clearInterval(interval);
      }
    }, 100);

    // Timeout after 10 seconds to avoid unnecessary polling if elements aren't mounted
    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isAuthenticated, email]);

  // 2. Dual-key storage check to launch welcome modal automatically
  useEffect(() => {
    if (!isAuthenticated || !email || !domReady) return;

    const emailKey = email.toLowerCase().trim();
    const triggerVal = localStorage.getItem(`fyp-onboarding-trigger-${emailKey}`);
    const completedVal = localStorage.getItem(`fyp-onboarding-completed-${emailKey}`);

    // Start tour only if trigger is true and completed is not true
    if (triggerVal === "true" && completedVal !== "true") {
      set({ showWelcomeModal: true });
    }
  }, [isAuthenticated, email, domReady, set]);

  // 3. Keep tracking bounding box and smooth scroll when active step changes
  useEffect(() => {
    if (!isTourActive) {
      setRect(null);
      return;
    }

    const selector = TOUR_STEPS[currentStep]?.target;
    if (!selector) {
      setRect(null);
      return;
    }

    const updateRect = () => {
      const el = document.querySelector(selector);
      if (el) {
        setRect(el.getBoundingClientRect());
      }
    };

    const scrollAndFetch = () => {
      const el = document.querySelector(selector);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        // Initial bounding rect capture
        updateRect();
        // Recalculate after scroll finishes to capture correct position
        const timer = setTimeout(updateRect, 500);
        return timer;
      }
    };

    const timer = scrollAndFetch();

    // Listen to window events to keep highlight coordinates updated in real time
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect);

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect);
    };
  }, [isTourActive, currentStep]);

  if (!isAuthenticated || !email) return null;

  const emailKey = email.toLowerCase().trim();

  // Helper actions
  const handleStartTour = () => {
    set({
      showWelcomeModal: false,
      isTourActive: true,
      currentStep: 0
    });
  };

  const handleSkipTour = () => {
    localStorage.setItem(`fyp-onboarding-completed-${emailKey}`, "true");
    set({
      showWelcomeModal: false,
      isTourActive: false,
      currentStep: 0,
      showCompletionModal: false
    });
  };

  const handleNextStep = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      set({ currentStep: currentStep + 1 });
    } else {
      localStorage.setItem(`fyp-onboarding-completed-${emailKey}`, "true");
      set({
        isTourActive: false,
        showCompletionModal: true
      });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 });
    }
  };

  // Get dynamic styles for positioning the popover card
  const getPopoverStyle = (targetRect: DOMRect | null): React.CSSProperties => {
    if (typeof window === "undefined") return {};
    const isMobile = window.innerWidth < 768;

    // Mobile style: fixed sheet at the bottom of the screen
    if (isMobile) {
      return {
        position: "fixed",
        bottom: "24px",
        left: "16px",
        right: "16px",
        zIndex: 50,
      };
    }

    // Default fallback when element position is not yet calculated
    if (!targetRect) {
      return {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 50,
      };
    }

    // Desktop positioning logic
    const gap = 16;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const popoverWidth = 350;
    const popoverHeight = 220; // safe estimation for layout

    // Center popover relative to target horizontally
    let left = targetRect.left + targetRect.width / 2 - popoverWidth / 2;
    // Position below the target by default
    let top = targetRect.bottom + gap;

    // Flip to above if going off the bottom of viewport
    if (top + popoverHeight > viewportHeight) {
      top = targetRect.top - popoverHeight - gap;
    }

    // Boundary containment checks
    if (left < 16) left = 16;
    if (left + popoverWidth > viewportWidth - 16) {
      left = viewportWidth - popoverWidth - 16;
    }
    if (top < 16) top = 16;

    return {
      position: "fixed",
      top: `${top}px`,
      left: `${left}px`,
      width: `${popoverWidth}px`,
      transform: isMobile ? "none" : "rotate(-1.2deg)",
      zIndex: 50,
    };
  };

  const popoverStyle = getPopoverStyle(rect);
  const isNearLeftEdge =
    popoverStyle.left !== undefined &&
    typeof popoverStyle.left === "string" &&
    parseInt(popoverStyle.left) < 120;

  return (
    <>
      <AnimatePresence>
        {/* Welcome Modal */}
        {showWelcomeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="relative w-[min(480px,92vw)] rounded-3xl border border-white/10 bg-card p-6 shadow-2xl space-y-6 text-center"
            >
              <div className="mx-auto w-24 h-24 pointer-events-none">
                <GuideMascot pose="waving" className="w-full h-full" />
              </div>
              <div className="space-y-2">
                <h2 className="font-display text-2xl font-bold tracking-wider text-white">
                  Welcome to FYP Comics! 📚✨
                </h2>
                <p className="text-sm text-muted leading-relaxed">
                  We are thrilled to have you join our platform! Let&apos;s take a quick 2-minute tour to help you get the most out of your premium comic reading experience.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  className="w-full font-bold shadow-lg shadow-primary/20"
                  variant="primary"
                  size="lg"
                  onClick={handleStartTour}
                >
                  Start Tour 🚀
                </Button>
                <Button
                  className="w-full text-muted hover:text-white"
                  variant="outline"
                  size="lg"
                  onClick={handleSkipTour}
                >
                  Skip Tour
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Completion Modal */}
        {showCompletionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="relative w-[min(480px,92vw)] rounded-3xl border border-white/10 bg-card p-6 shadow-2xl space-y-6 text-center"
            >
              <div className="mx-auto w-24 h-24 pointer-events-none">
                <GuideMascot pose="waving" className="w-full h-full" />
              </div>
              <div className="space-y-2">
                <h2 className="font-display text-2xl font-bold tracking-wider text-white">
                  You&apos;re All Set! 🎉
                </h2>
                <p className="text-sm text-muted leading-relaxed">
                  You&apos;re all set! Enjoy exploring the platform.
                </p>
              </div>
              <Button
                className="w-full font-bold shadow-lg shadow-emerald-500/20"
                variant="primary"
                size="lg"
                onClick={() => set({ showCompletionModal: false })}
              >
                Enjoy Reading 📖
              </Button>
            </motion.div>
          </div>
        )}

        {/* Tour Active Step Overlay & Dialog */}
        {isTourActive && (
          <>
            {/* Click shield: prevents interactions with the website elements underneath */}
            <div
              className="fixed inset-0 z-40 bg-transparent cursor-default pointer-events-auto"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            />

            {/* Cutout highlighting the active element using huge shadows */}
            {rect && (
              <motion.div
                initial={false}
                animate={{
                  left: rect.left - 8,
                  top: rect.top - 8,
                  width: rect.width + 16,
                  height: rect.height + 16,
                }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                className="fixed border border-primary/20 pointer-events-none z-40 transition-shadow duration-300"
                style={{
                  borderRadius: "16px",
                  boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.72), 0 0 16px rgba(255, 51, 102, 0.4)",
                }}
              />
            )}

            {/* Tooltip Dialog Card Wrapper (handles positioning and shadow) */}
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.18 }}
              style={{
                ...popoverStyle,
                filter: "drop-shadow(4px 6px 12px rgba(0,0,0,0.15)) drop-shadow(0 12px 28px rgba(0,0,0,0.22))"
              }}
              className="relative pointer-events-auto transition-all"
            >


              {/* Floating Guide Robot Mascot */}
              <div
                className={`absolute pointer-events-none transition-all duration-300 ${
                  isNearLeftEdge
                    ? "md:-right-32 md:left-auto md:scale-x-[-1]"
                    : "md:-left-32 md:right-auto md:scale-x-[1]"
                } md:top-1/2 md:-translate-y-1/2 md:bottom-auto md:w-36 md:h-36 -top-28 left-1/2 -translate-x-1/2 md:translate-x-0 w-32 h-32 z-20`}
              >
                <GuideMascot
                  pose={currentStep === 0 ? "waving" : "pointing"}
                  className="w-full h-full"
                />
              </div>

              {/* Torn Paper Card Container with double-drawn SVG borders */}
              <div className="relative p-6 pt-8 pb-6 flex flex-col gap-4 text-[#1c1917]">
                
                {/* Responsive hand-drawn sketchy card border & background */}
                <div className="absolute inset-0 z-0 w-full h-full pointer-events-none select-none">
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    className="w-full h-full overflow-visible"
                  >
                    {/* Outer/Main Path */}
                    <path
                      d="M 2 3
                         Q 25 1 50 3 Q 75 1.5 98 2
                         Q 97 25 98.5 50 Q 97.5 75 98 98
                         Q 75 97.5 50 99 Q 25 97 2 98
                         Q 1.5 75 2 50 Q 2.5 25 2 3 Z"
                      fill="#fafaf6"
                      stroke="#1c1917"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                    {/* Inner/Sketch Secondary Path */}
                    <path
                      d="M 3 2.5
                         Q 25 3.2 50 2.2 Q 75 3 97 1.8
                         Q 97.5 25 97.8 50 Q 97 75 97.2 97
                         Q 75 97.8 50 97.2 Q 25 98.2 3 97.2
                         Q 2.2 75 2.5 50 Q 2 25 3 2.5 Z"
                      fill="none"
                      stroke="#1c1917"
                      strokeWidth="0.8"
                      opacity="0.8"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                {/* Content Layout */}
                <div className="relative z-10 flex flex-col gap-3.5">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black tracking-wider uppercase text-[#1c1917]/70">
                      STEP {currentStep + 1} OF {TOUR_STEPS.length}
                    </span>
                    <button
                      onClick={handleSkipTour}
                      className="text-[#1c1917] hover:text-[#ff7b9a] transition-colors pointer-events-auto"
                      aria-label="Skip onboarding guide"
                      title="Skip Tour"
                    >
                      <X className="h-4.5 w-4.5 stroke-[2.5px]" />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="space-y-1">
                    <h3 className="font-display text-xl font-black tracking-wide text-[#1c1917]">
                      {TOUR_STEPS[currentStep]?.title}
                    </h3>
                    <p className="text-xs text-[#1c1917]/85 leading-relaxed font-bold">
                      {TOUR_STEPS[currentStep]?.content}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={handleSkipTour}
                      className="text-xs font-black text-[#1c1917] hover:text-[#ff7b9a] transition-colors pointer-events-auto bg-transparent border-none"
                    >
                      Skip
                    </button>
                    <div className="flex gap-2">
                      {currentStep > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePrevStep}
                          className="h-8 text-xs gap-1 border-2 border-[#1c1917] text-[#1c1917] bg-transparent hover:bg-[#1c1917]/5 font-black rounded-full px-4 pointer-events-auto shadow-none"
                        >
                          ← Prev
                        </Button>
                      )}
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleNextStep}
                        className="h-8 text-xs gap-1 bg-[#ff7b9a] hover:bg-[#ff5a79] text-white border-2 border-[#1c1917] font-black rounded-full px-4 pointer-events-auto shadow-none"
                      >
                        {currentStep === TOUR_STEPS.length - 1 ? (
                          "Finish"
                        ) : (
                          <>
                            Next →
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
