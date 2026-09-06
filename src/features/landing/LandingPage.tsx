"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Sparkles, Shield, Star, Layout, Check, ShieldAlert, Zap } from "lucide-react";
import Link from "@/compat/next-link";
import { Navbar } from "../discovery/Navbar";
import { useAuthStore } from "@/store/authStore";

export function LandingPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [spoilerChapter, setSpoilerChapter] = useState(3);
  const [demoQuestion, setDemoQuestion] = useState<string | null>(null);
  const [demoAnswer, setDemoAnswer] = useState<string | null>(null);
  const [loadingDemo, setLoadingDemo] = useState(false);

  const demoQuestions = [
    {
      q: "Who is Faraday working with?",
      ans: (chap: number) => {
        if (chap < 4) {
          return "Faraday is a fixer operating in Santo Domingo, coordinating high-risk corporate jobs. Details of his corporate partners are kept secret until Chapter 4.";
        }
        return "Faraday is working as a double-agent fixer for Arasaka Corporation, attempting to extract the secret cyber-skeleton project details from Militech operatives.";
      }
    },
    {
      q: "What happens to the cyber-skeleton?",
      ans: (chap: number) => {
        if (chap < 6) {
          return "The cyber-skeleton is a high-grade military prototype weapon currently locked in Arasaka's research facility in Santo Domingo.";
        }
        return "⚠️ Spoiler alert unlocked! David Martinez installs the cyber-skeleton prototype in Chapter 6 to rescue Lucy, leading to a high-speed military pursuit.";
      }
    }
  ];

  const handleDemoQuestionClick = (qText: string, answerFn: (c: number) => string) => {
    setLoadingDemo(true);
    setDemoQuestion(qText);
    setTimeout(() => {
      setDemoAnswer(answerFn(spoilerChapter));
      setLoadingDemo(false);
    }, 700);
  };

  return (
    <div className="min-h-dvh flex flex-col bg-bg text-white relative">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4">
        {/* Soft glowing ambient circle lights */}
        <div className="absolute top-[10%] left-[10%] w-[380px] h-[380px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-[20%] right-[10%] w-[380px] h-[380px] bg-[#22c55e]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary uppercase tracking-wider"
            >
              <Sparkles className="h-3.5 w-3.5" />
              The Next Gen Comic Portal
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display text-4xl sm:text-6xl tracking-tight leading-[1.08] font-bold"
            >
              Fueling Your <br className="hidden sm:inline" />
              <span className="text-[#22c55e] drop-shadow-[0_0_25px_rgba(34,197,94,0.18)]">Potential</span>. Discover <br className="hidden sm:inline" />
              Indie Comics.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-sm sm:text-base text-muted max-w-2xl leading-relaxed font-light"
            >
              Experience high-resolution, panel-by-panel comic reading, explore interactive spoiler-free lore guides assisted by AI, and directly reward independent writers.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link href="/discover" className="sf-clickable inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-white hover:opacity-90 shadow-[0_4px_24px_rgba(255,51,102,0.35)]">
                Explore Library
                <ArrowRight className="h-4 w-4" />
              </Link>
              {!isAuthenticated && (
                <Link href="/register" className="sf-clickable inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold hover:bg-white/8">
                  Get Started
                </Link>
              )}
            </motion.div>
          </div>

          {/* Hero Visual Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            {/* Core reader panel mockup */}
            <div className="relative rounded-3xl border border-white/10 bg-card p-4 shadow-2xl overflow-hidden aspect-[4/3] flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 z-10" />
              <img
                src="/branding/fyp-logo.png"
                alt="FYP Mockup Logo"
                className="absolute z-20 h-16 w-auto object-contain opacity-70 drop-shadow-[0_0_12px_rgba(34,197,94,0.3)]"
              />
              <div className="absolute bottom-6 left-6 right-6 z-20 space-y-2">
                <div className="text-xs font-semibold text-[#22c55e] uppercase tracking-widest">Featured Release</div>
                <div className="text-xl font-bold tracking-wide font-display">Cyberpunk: Edgerunners</div>
                <div className="flex gap-2">
                  <span className="text-[10px] bg-white/10 px-2.5 py-0.5 rounded-full text-muted uppercase tracking-wider">Sci-Fi</span>
                  <span className="text-[10px] bg-[#22c55e]/15 text-[#22c55e] px-2.5 py-0.5 rounded-full uppercase tracking-wider font-semibold">12 Chapters</span>
                </div>
              </div>
            </div>

          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-white/5 bg-white/[0.01] py-8">
        <div className="mx-auto max-w-6xl px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-white font-display">50K+</div>
            <div className="text-xs text-muted mt-1 uppercase tracking-wider">Active Readers</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-[#22c55e] font-display">1.2K+</div>
            <div className="text-xs text-muted mt-1 uppercase tracking-wider">Comic Chapters</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white font-display">100%</div>
            <div className="text-xs text-muted mt-1 uppercase tracking-wider">Spoiler-Free Guides</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary font-display">60 FPS</div>
            <div className="text-xs text-muted mt-1 uppercase tracking-wider">Smooth Reading</div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="text-center space-y-3">
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">Immersive Features Designed for Creators & Readers</h2>
            <p className="text-sm text-muted max-w-xl mx-auto font-light">
              Experience the core innovations that distinguish FYP as the premier portal for graphic indie fiction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="sf-comic-panel sf-comic-surface border border-white/8 rounded-3xl p-6 bg-card space-y-4 hover:border-primary/20 transition-all duration-300 group">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold font-display group-hover:text-primary transition-colors">Spoiler-Free Lore Assistant</h3>
              <p className="text-xs text-muted leading-relaxed">
                Connect directly with the AI Loremaster. Configure your reading progress and ask questions about characters, maps, or background lore with complete confidence.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="sf-comic-panel sf-comic-surface border border-white/8 rounded-3xl p-6 bg-card space-y-4 hover:border-[#22c55e]/25 transition-all duration-300 group">
              <div className="h-10 w-10 rounded-xl bg-[#22c55e]/10 flex items-center justify-center border border-[#22c55e]/20">
                <BookOpen className="h-5 w-5 text-[#22c55e]" />
              </div>
              <h3 className="text-lg font-bold font-display group-hover:text-[#22c55e] transition-colors">High-Resolution Reader</h3>
              <p className="text-xs text-muted leading-relaxed">
                Enjoy customized, mobile-optimized scrolling and paneled navigation. Bookmark your catalog items and save progress seamlessly across devices.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="sf-comic-panel sf-comic-surface border border-white/8 rounded-3xl p-6 bg-card space-y-4 hover:border-yellow-500/25 transition-all duration-300 group">
              <div className="h-10 w-10 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                <Star className="h-5 w-5 text-yellow-500" />
              </div>
              <h3 className="text-lg font-bold font-display group-hover:text-yellow-500 transition-colors">Chapter Reviews & Discussions</h3>
              <p className="text-xs text-muted leading-relaxed">
                Rate and review individual chapters, join the community discussions under every issue, and share your reactions with comic creators directly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Lore Demo Section */}
      <section className="py-16 px-4 bg-white/[0.01] border-y border-white/5 relative">
        <div className="absolute top-[30%] right-[20%] w-[280px] h-[280px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <h2 className="font-display text-3xl font-bold tracking-tight">Try the Spoiler-Free AI Loremaster</h2>
            <p className="text-xs text-muted leading-relaxed font-light">
              Test how our smart AI filters responses according to your chapter progress. Adjust the reading slider to Chapter 3 or 6, select a question, and watch how the loremaster filters spoilers!
            </p>

            <div className="space-y-3 bg-white/5 rounded-2xl p-4 border border-white/5">
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Your Reading Progress: <span className="text-[#22c55e]">Chapter {spoilerChapter}</span>
              </label>
              <input
                type="range"
                min="1"
                max="8"
                value={spoilerChapter}
                onChange={(e) => {
                  setSpoilerChapter(Number(e.target.value));
                  setDemoQuestion(null);
                  setDemoAnswer(null);
                }}
                className="w-full accent-primary bg-white/10 rounded-lg h-1.5 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted font-mono">
                <span>Chapter 1</span>
                <span>Chapter 4</span>
                <span>Chapter 8</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-muted uppercase tracking-wider">Ask Loremaster:</div>
              <div className="flex flex-col gap-2">
                {demoQuestions.map((qObj, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleDemoQuestionClick(qObj.q, qObj.ans)}
                    className="sf-clickable w-full text-left text-xs bg-white/5 hover:bg-white/8 border border-white/8 rounded-xl px-4 py-3 transition-colors text-slate-200 flex items-center justify-between"
                  >
                    {qObj.q}
                    <ArrowRight className="h-3.5 w-3.5 text-muted shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            {/* Interactive Chat Console */}
            <div className="rounded-3xl border border-white/10 bg-card/60 shadow-2xl p-6 relative overflow-hidden min-h-[300px] flex flex-col justify-between">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-[#22c55e] to-teal-400" />
              
              <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 bg-[#22c55e] rounded-full animate-pulse" />
                  <span className="text-xs font-bold tracking-wider uppercase">Loremaster AI Terminal</span>
                </div>
                <div className="text-[10px] bg-white/5 border border-white/8 rounded-full px-3 py-0.5 text-muted">
                  Spoiler Level: <span className="text-[#22c55e] font-semibold">Chapter {spoilerChapter}</span>
                </div>
              </div>

              <div className="flex-1 space-y-4 text-xs font-mono">
                {demoQuestion ? (
                  <div className="space-y-4">
                    <div className="flex justify-end">
                      <div className="bg-primary/10 border border-primary/20 rounded-2xl px-4 py-2.5 max-w-[85%] text-slate-100">
                        {demoQuestion}
                      </div>
                    </div>

                    <div className="flex justify-start">
                      <div className="bg-white/5 border border-white/8 rounded-2xl px-4 py-3 max-w-[85%] text-slate-300 relative">
                        {loadingDemo ? (
                          <div className="flex items-center gap-2 text-muted">
                            <Zap className="h-3.5 w-3.5 animate-bounce" />
                            Thinking...
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center gap-1.5 text-primary text-[10px] font-bold uppercase tracking-wider mb-1">
                              <Sparkles className="h-3 w-3" /> Response Calibrated
                            </div>
                            {demoAnswer}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted space-y-2">
                    <ShieldAlert className="h-8 w-8 text-muted/65" />
                    <p className="text-xs">No question selected. Click a question on the left to see the AI Loremaster handle spoilers.</p>
                  </div>
                )}
              </div>

              <div className="mt-4 border-t border-white/5 pt-3 text-[10px] text-muted flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-[#22c55e]" />
                Interactive protection filters loaded automatically.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conversion / CTA Banner */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-gradient-to-br from-primary/10 via-[#22c55e]/5 to-teal-500/5 p-8 sm:p-12 text-center space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-card/40 z-0" />
          <div className="relative z-10 space-y-6">
            <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight">Ready to Enter the FYP Universe?</h2>
            <p className="text-xs sm:text-sm text-muted max-w-xl mx-auto leading-relaxed">
              Unlock exclusive chapters, interact with spoiler-free lore indices, and join a growing community of indie comic creators.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link href="/discover" className="sf-clickable inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-sm font-bold text-white hover:opacity-95 shadow-[0_4px_24px_rgba(255,51,102,0.4)]">
                Browse Library
                <ArrowRight className="h-4.5 w-4.5" />
              </Link>
              {!isAuthenticated && (
                <Link href="/register" className="sf-clickable inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-semibold hover:bg-white/8">
                  Create Free Account
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/8 bg-bg/60 mt-auto">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col gap-3">
              <span className="font-display text-xl font-bold tracking-widest text-[#22c55e]">FYP</span>
              <p className="text-xs text-muted leading-relaxed">
                Your premium portal for indie comics, spoiler-free lore assistants, and immersive digital reading.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-4">Explore</h4>
              <ul className="space-y-2.5 text-xs text-muted">
                <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
                <li><Link href="/discover" className="hover:text-primary transition-colors">Discover</Link></li>
                <li><Link href="/series" className="hover:text-primary transition-colors">Series</Link></li>
                <li><Link href="/vault" className="hover:text-primary transition-colors">Vault</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-4">Community</h4>
              <ul className="space-y-2.5 text-xs text-muted">
                <li><a href="#" className="hover:text-primary transition-colors">Discord Server</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Twitter Feed</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Reddit Sub</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-4">Support</h4>
              <ul className="space-y-2.5 text-xs text-muted">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 mt-10 pt-6 text-center text-xs text-muted">
            © {new Date().getFullYear()} FYP. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
