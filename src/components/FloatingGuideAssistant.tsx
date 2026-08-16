"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useOnboardingStore } from "@/store/onboardingStore";
import { usePathname, useRouter } from "@/compat/next-navigation";
import { AnimatePresence, motion } from "framer-motion";
import { GuideMascot } from "./GuideMascot";
import { Play, RotateCcw, X, MessageCircle } from "lucide-react";

export function FloatingGuideAssistant() {
  const { isAuthenticated } = useAuthStore();
  const { isTourActive, set } = useOnboardingStore();
  const pathname = usePathname();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close the popup menu if clicking outside the container
  useEffect(() => {
    if (!menuOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [menuOpen]);

  // If user is not logged in, or if the onboarding tour is currently running, hide the persistent assistant
  if (!isAuthenticated || isTourActive) {
    return null;
  }

  const handleStartTour = () => {
    setMenuOpen(false);
    const path = pathname || "/";
    if (path !== "/") {
      router.push("/");
      // Brief delay to allow navigation to complete before triggering tour
      setTimeout(() => {
        set({
          isTourActive: true,
          currentStep: 0,
          showWelcomeModal: false,
          showCompletionModal: false
        });
      }, 600);
    } else {
      set({
        isTourActive: true,
        currentStep: 0,
        showWelcomeModal: false,
        showCompletionModal: false
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed z-40 transition-all duration-300 bottom-20 right-6 md:bottom-6 md:right-6"
    >
      <div className="relative">
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.95 }}
              transition={{ duration: 0.18 }}
              className="absolute right-0 bottom-20 w-56 overflow-hidden rounded-2xl border border-white/10 bg-card/95 backdrop-blur-2xl p-2.5 shadow-2xl z-50 flex flex-col gap-1 text-white"
            >
              <div className="border-b border-white/10 px-2 py-1.5 mb-1.5 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  Mascot Assistant
                </span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="text-muted hover:text-white transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>

              <button
                onClick={handleStartTour}
                className="sf-clickable flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl text-left text-muted hover:bg-white/5 hover:text-white transition-colors"
              >
                <Play className="h-3.5 w-3.5 text-primary" />
                Take a website tour
              </button>

              <button
                onClick={handleStartTour}
                className="sf-clickable flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl text-left text-muted hover:bg-white/5 hover:text-white transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5 text-primary" />
                Restart the guide
              </button>

              <button
                onClick={() => setMenuOpen(false)}
                className="sf-clickable flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl text-left text-muted hover:bg-white/5 hover:text-white transition-colors"
              >
                <X className="h-3.5 w-3.5 text-rose-400" />
                Close
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mascot Bubble Trigger Button */}
        <button
          onClick={() => setMenuOpen((open) => !open)}
          className="sf-clickable group relative grid h-16 w-16 place-items-center rounded-full border border-white/10 bg-card/80 backdrop-blur-md shadow-2xl hover:border-primary/40 hover:bg-card hover:scale-105 transition-all cursor-pointer"
          aria-label="Open assistant menu"
        >
          {/* Animated floating mascot nested inside */}
          <GuideMascot
            pose={menuOpen ? "waving" : "idle"}
            className="w-12 h-12"
          />

          {/* Badge indicator */}
          <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </span>
        </button>
      </div>
    </div>
  );
}
