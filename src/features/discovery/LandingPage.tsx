"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/compat/next-navigation";
import { motion } from "framer-motion";
import { BookOpen, Sparkles, LogIn, ArrowRight, ShieldCheck, Zap, Users } from "lucide-react";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import type { Series } from "@/lib/types";

export function LandingPage() {
  const router = useRouter();
  const [seriesList, setSeriesList] = useState<Series[]>([]);

  useEffect(() => {
    fetch("/api/series")
      .then((r) => r.json())
      .then((data) => setSeriesList(data.slice(0, 4)))
      .catch(() => setSeriesList([]));
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  } as const;

  return (
    <div className="min-h-dvh bg-bg overflow-x-hidden relative">
      {/* Background Mesh Gradients */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] aspect-square rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[60%] aspect-square rounded-full bg-highlight/12 blur-[140px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[45%] aspect-square rounded-full bg-gold/10 blur-[130px]" />
        <div className="absolute inset-0 bg-repeat bg-[linear-gradient(135deg,rgba(255,255,255,0.015)_0px,rgba(255,255,255,0.015)_1px,transparent_1px,transparent_16px)]" />
      </div>

      {/* Header Bar */}
      <header className="relative z-10 mx-auto max-w-6xl px-4 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <img src="/branding/fyp-logo.png" alt="FYP Logo" className="h-12 w-auto object-contain" />
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/login")} className="gap-2">
            <LogIn className="h-4 w-4" /> Login
          </Button>
          <Button variant="primary" size="sm" onClick={() => router.push("/register")}>
            Sign Up
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-6xl px-4 py-12 md:py-20 space-y-24">
        {/* Hero Section */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-3xl mx-auto space-y-6"
        >
          <motion.div variants={itemVariants} className="inline-flex">
            <Badge tone="gold" className="gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border border-gold/20 bg-gold/10">
              <Sparkles className="h-3.5 w-3.5" /> Next-Gen Comic Platform
            </Badge>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight drop-shadow-[0_0_30px_rgba(255,51,102,0.15)]"
          >
            Read Premium Comics <br />
            <span className="bg-gradient-to-r from-primary via-pink-500 to-highlight bg-clip-text text-transparent">
              Like Never Before
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-muted text-base sm:text-lg max-w-xl mx-auto leading-relaxed"
          >
            Immerse yourself in high-definition indie and premium comics with cinematic background scores, spoiler-safe AI lore assistants, and exclusive reader rewards.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button variant="primary" size="lg" onClick={() => router.push("/register")} className="gap-2 group">
              Get Started <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                const element = document.getElementById("teaser-catalog");
                element?.scrollIntoView({ behavior: "smooth" });
              }}
              className="gap-2"
            >
              <BookOpen className="h-4 w-4" /> Explore Comics
            </Button>
          </motion.div>
        </motion.section>

        {/* Feature Cards Grid */}
        <section className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Zap,
              title: "Immersive Reading Mode",
              desc: "Experience comics in 3D flip or scroll styles with synced atmospheric background audio tailormade for each panel.",
              color: "text-primary",
              bg: "bg-primary/5 border-primary/10",
            },
            {
              icon: ShieldCheck,
              title: "Spoiler-Safe AI Companion",
              desc: "Query the AI Lore Master about story points, characters, or locations without spoiling future chapters.",
              color: "text-highlight",
              bg: "bg-highlight/5 border-highlight/10",
            },
            {
              icon: Users,
              title: "Earn Loyalty Points",
              desc: "Unlock premium rewards, support your favorite creators, and trade coins simply by reading daily.",
              color: "text-gold",
              bg: "bg-gold/5 border-gold/10",
            },
          ].map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`p-6 rounded-3xl border ${feat.bg} flex flex-col gap-3 hover:scale-[1.02] transition-transform`}
              >
                <div className={`p-3 rounded-2xl w-fit bg-white/5 ${feat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-white">{feat.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{feat.desc}</p>
              </motion.div>
            );
          })}
        </section>

        {/* Teaser Catalog Preview */}
        <section id="teaser-catalog" className="space-y-6 pt-10 scroll-mt-20">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl tracking-wider text-white">Popular Releases</h2>
              <p className="text-sm text-muted">Join millions of readers exploring top stories.</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push("/login")} className="self-start md:self-auto">
              Unlock All Series
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {seriesList.map((series, idx) => (
              <motion.div
                key={series.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                onClick={() => router.push("/login")}
                className="sf-comic-card group relative block overflow-hidden rounded-2xl border border-white/10 bg-card/65 transition cursor-pointer hover:border-primary/35 hover:bg-white/7"
              >
                <div className="aspect-[3/4] w-full overflow-hidden">
                  <img
                    src={series.coverUrl}
                    alt={series.title}
                    className="sf-comic-image h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="p-3 space-y-1">
                  <div className="truncate font-semibold text-white text-sm group-hover:text-highlight transition">
                    {series.title}
                  </div>
                  <div className="text-xs text-muted flex items-center justify-between">
                    <span>{series.genre}</span>
                    <span className="text-gold">★ {series.rating}</span>
                  </div>
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-xs font-semibold bg-primary text-white px-3 py-1.5 rounded-full">
                    Read Now
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black/20 mt-20">
        <div className="mx-auto max-w-6xl px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <div className="flex items-center gap-2">
            <span className="font-display tracking-widest text-sm text-white">FYP</span>
            <span>© {new Date().getFullYear()} FYP Comics</span>
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition">Terms</a>
            <a href="#" className="hover:text-white transition">Privacy</a>
            <a href="#" className="hover:text-white transition">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
