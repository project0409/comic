"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import Link from "@/compat/next-link";
import { useAuthStore } from "@/store/authStore";
import { useOnboardingStore } from "@/store/onboardingStore";
import { usePathname, useRouter } from "@/compat/next-navigation";
import { AnimatePresence, motion } from "framer-motion";
import { GuideMascot } from "./GuideMascot";
import { Play, X, MessageSquare, Send, Sparkles, ChevronRight } from "lucide-react";
import { seriesList } from "@/lib/mockData";
import { cn } from "@/components/cn";
import { Button } from "./Button";

interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  recommendedSeriesIds?: string[];
}

export function FloatingGuideAssistant() {
  const { isAuthenticated } = useAuthStore();
  const { isTourActive, set } = useOnboardingStore();
  const pathname = usePathname();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Chat Agent State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      sender: "agent",
      text: "Hello! I am your Genre Recommendation Agent. 🧠\nWhich style or genre of comic are you looking to read? Select a chip or describe what you want!"
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [agentTyping, setAgentTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Close the popup menu if clicking outside the container
  useEffect(() => {
    if (!menuOpen && !chatOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        // Note: We don't auto-close the active chat window to avoid accidental losses,
        // but we auto-close the tiny popover menu.
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [menuOpen, chatOpen]);

  // Scroll chat to bottom on updates
  useEffect(() => {
    if (chatOpen) {
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 80);
    }
  }, [chatMessages, agentTyping, chatOpen]);

  // If user is not logged in, or if the onboarding tour is currently running, hide the persistent assistant
  if (!isAuthenticated || isTourActive) {
    return null;
  }

  const handleStartTour = () => {
    setMenuOpen(false);
    const path = pathname || "/";
    if (path !== "/") {
      router.push("/");
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

  const triggerAgentReply = (userQuery: string) => {
    setAgentTyping(true);

    setTimeout(() => {
      const query = userQuery.toLowerCase().trim();
      let replyText = "";
      let matchedIds: string[] = [];

      if (query.includes("action") || query.includes("blade") || query.includes("fight")) {
        replyText = "💥 high-intensity Action and clashing steel! Try these Action & Fantasy comics:";
        matchedIds = seriesList.filter((s) => s.genre === "Action" || s.genre === "Fantasy").map((s) => s.id);
      } else if (query.includes("sci-fi") || query.includes("cyberpunk") || query.includes("hacker") || query.includes("future")) {
        replyText = "🚀 Cybernetic matrix hacking and futuristic systems! Try these Sci-Fi recommendations:";
        matchedIds = seriesList.filter((s) => s.genre === "Sci-Fi").map((s) => s.id);
      } else if (query.includes("romance") || query.includes("love") || query.includes("heart")) {
        replyText = "💖 Fast circuits and encryption key romance! Try this popular pick:";
        matchedIds = seriesList.filter((s) => s.genre === "Romance").map((s) => s.id);
      } else if (query.includes("horror") || query.includes("spooky") || query.includes("scary")) {
        replyText = "💀 Deep static radio cosmic horrors! Try this Horror selection:";
        matchedIds = seriesList.filter((s) => s.genre === "Horror").map((s) => s.id);
      } else if (query.includes("mystery") || query.includes("detective") || query.includes("mirror")) {
        replyText = "🔍 mirrorglass alibis and clues! Try these Mystery selections:";
        matchedIds = seriesList.filter((s) => s.genre === "Mystery").map((s) => s.id);
      } else if (query.includes("fantasy") || query.includes("dragon")) {
        replyText = "🐉 Magical forge fires and biological dragon-drives! Take a look:";
        matchedIds = seriesList.filter((s) => s.genre === "Fantasy").map((s) => s.id);
      } else {
        replyText = "💡 Here are the top-rated recommendations trending on FYP right now:";
        matchedIds = [...seriesList].sort((a, b) => b.rating - a.rating).slice(0, 3).map((s) => s.id);
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: `reply_${Date.now()}`,
          sender: "agent",
          text: replyText,
          recommendedSeriesIds: matchedIds
        }
      ]);
      setAgentTyping(false);
    }, 1200);
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const newMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: "user",
      text
    };

    setChatMessages((prev) => [...prev, newMsg]);
    if (!textToSend) setInputText("");
    triggerAgentReply(text);
  };

  return (
    <div
      ref={containerRef}
      className="fixed z-50 transition-all duration-300 bottom-20 right-6 md:bottom-6 md:right-6"
    >
      <div className="relative">
        <AnimatePresence>
          {/* MASCOT MENU POPOVER */}
          {menuOpen && !chatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.95 }}
              transition={{ duration: 0.18 }}
              className="absolute right-0 bottom-20 w-60 overflow-hidden rounded-2xl border border-white/10 bg-card/95 backdrop-blur-2xl p-2.5 shadow-2xl z-50 flex flex-col gap-1 text-white"
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
                onClick={() => {
                  setMenuOpen(false);
                  setChatOpen(true);
                }}
                className="sf-clickable flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl text-left text-muted hover:bg-white/5 hover:text-white transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                Genre Recommendation Agent
              </button>

              <button
                onClick={handleStartTour}
                className="sf-clickable flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl text-left text-muted hover:bg-white/5 hover:text-white transition-colors"
              >
                <Play className="h-3.5 w-3.5 text-primary" />
                Take a website tour
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

          {/* GLOBAL RECOMMENDATION AGENT DRAWER */}
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 bottom-20 w-[320px] md:w-[360px] h-[460px] rounded-3xl border border-white/10 bg-card/95 backdrop-blur-2xl flex flex-col overflow-hidden text-white shadow-2xl z-50"
            >
              {/* Header */}
              <div className="bg-white/5 p-3 px-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-sm">
                    🤖
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">Genre Agent</h3>
                    <span className="text-[9px] text-emerald-400 font-semibold">Online · Ready</span>
                  </div>
                </div>
                <button
                  onClick={() => setChatOpen(false)}
                  className="p-1 rounded-full hover:bg-white/10 text-muted hover:text-white transition-colors"
                  aria-label="Close chat"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Message scroll area */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 select-text">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex flex-col max-w-[85%] space-y-1.5",
                      msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                    )}
                  >
                    <div
                      className={cn(
                        "p-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap",
                        msg.sender === "user"
                          ? "bg-primary text-white rounded-br-none"
                          : "bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white/95 rounded-bl-none"
                      )}
                    >
                      {msg.text}
                    </div>

                    {msg.recommendedSeriesIds && msg.recommendedSeriesIds.length > 0 && (
                      <div className="w-full flex flex-col gap-1.5 pt-0.5 select-none">
                        {msg.recommendedSeriesIds
                          .map((id) => seriesList.find((s) => s.id === id))
                          .filter((s) => s !== undefined)
                          .map((s) => (
                            <Link
                              href={`/series/${s.id}`}
                              key={s.id}
                              onClick={() => setChatOpen(false)}
                              className="flex items-center gap-2 p-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:border-primary/25 rounded-xl transition"
                            >
                              <img
                                src={s.coverUrl}
                                alt={s.title}
                                className="h-9 w-6 rounded object-cover shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <h4 className="text-[10px] font-bold text-slate-850 dark:text-white truncate">
                                  {s.title}
                                </h4>
                                <span className="text-[8px] text-primary font-bold">
                                  ★ {s.rating} · {s.genre}
                                </span>
                              </div>
                              <ChevronRight className="h-3.5 w-3.5 text-muted" />
                            </Link>
                          ))}
                      </div>
                    )}
                  </div>
                ))}

                {agentTyping && (
                  <div className="flex items-center gap-1.5 p-2.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-500 dark:text-muted w-24 mr-auto rounded-bl-none animate-pulse">
                    <span>Searching...</span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Chips row */}
              <div className="p-2.5 bg-white/5 border-t border-white/10 space-y-1.5 select-none">
                <span className="text-[8px] uppercase tracking-wider font-bold text-muted block">
                  Select Genre:
                </span>
                <div className="flex flex-wrap gap-1">
                  {[
                    { label: "Action 💥", query: "Action" },
                    { label: "Sci-Fi 🚀", query: "Sci-Fi" },
                    { label: "Romance 💖", query: "Romance" },
                    { label: "Mystery 🔍", query: "Mystery" },
                    { label: "Fantasy 🐉", query: "Fantasy" },
                    { label: "Horror 💀", query: "Horror" }
                  ].map((chip) => (
                    <button
                      key={chip.label}
                      onClick={() => handleSendMessage(chip.query)}
                      className="px-2 py-0.5 text-[9px] bg-black/40 border border-white/10 hover:border-primary/30 text-white rounded-full transition"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input row */}
              <div className="p-2.5 bg-white/5 border-t border-white/10 flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="Ask for genre recommendations..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 h-8 px-2.5 rounded-xl border border-white/10 bg-black/35 text-xs outline-none text-white focus:border-primary/35"
                />
                <button
                  onClick={() => handleSendMessage()}
                  className="h-8 w-8 rounded-xl bg-primary text-white hover:bg-primary/95 flex items-center justify-center transition"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mascot Bubble Button */}
        <button
          onClick={() => {
            if (chatOpen) {
              setChatOpen(false);
            } else {
              setMenuOpen((open) => !open);
            }
          }}
          className="sf-clickable group relative grid h-16 w-16 place-items-center rounded-full border border-white/10 bg-card/80 backdrop-blur-md shadow-2xl hover:border-primary/40 hover:bg-card hover:scale-105 transition-all cursor-pointer"
          aria-label="Open assistant menu"
        >
          <GuideMascot
            pose={menuOpen ? "waving" : chatOpen ? "pointing" : "idle"}
            className="w-12 h-12"
          />

          <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </span>
        </button>
      </div>
    </div>
  );
}
