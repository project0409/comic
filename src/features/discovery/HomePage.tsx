"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUp, Twitter, Instagram, Github, MessageSquare } from "lucide-react";
import Link from "@/compat/next-link";
import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { StatsBar } from "./StatsBar";
import { ReleaseCalendar } from "./ReleaseCalendar";
import { SeriesCatalog } from "./SeriesCatalog";
import { CarouselRow } from "./CarouselRow";
import type { Series } from "@/lib/types";
import { releaseCalendar } from "@/lib/mockData";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";
import { consumeAuthFlash } from "@/lib/authFlash";
import { useToastStore } from "@/store/toastStore";
import { useWalletStore } from "@/store/walletStore";

export function HomePage() {
  const toast = useToastStore((s) => s.push);
  const coinBalance = useWalletStore((s) => s.coinBalance);
  const [all, setAll] = useState<Series[]>([]);
  const [q, setQ] = useState("");
  const [genre, setGenre] = useState<string | undefined>(undefined);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const flash = consumeAuthFlash();
    if (flash?.type === "login_success") {
      toast({
        tone: "success",
        title: "Login successful",
        message: flash.displayName ? `Welcome back, ${flash.displayName}!` : "Welcome back to FYP!"
      });
    }
  }, [toast]);

  useEffect(() => {
    fetch("/api/series")
      .then((r) => r.json())
      .then(setAll)
      .catch(() => setAll([]));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filtered = useMemo(() => {
    return all.filter((s) => {
      const matchQ = q ? s.title.toLowerCase().includes(q.toLowerCase()) : true;
      const matchG = genre ? s.genre === genre : true;
      return matchQ && matchG;
    });
  }, [all, q, genre]);

  const trendingSeries = filtered[0] ?? all[0];
  const trending = filtered.slice(0, 8);

  return (
    <div className="min-h-dvh relative">
      <Navbar
        onSearch={(query, g) => {
          setQ(query);
          setGenre(g);
        }}
      />

      <motion.main
        className="mx-auto max-w-6xl space-y-12 px-4 py-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, ease: "easeOut" }}
      >
        <Hero trendingSeries={trendingSeries} coinBalance={coinBalance} />

        <StatsBar coinBalance={coinBalance} />

        {trending.length > 0 ? <CarouselRow title="Trending Series" items={trending.slice(0, 6)} /> : null}

        <ReleaseCalendar items={releaseCalendar} />

        <SeriesCatalog series={filtered.length ? filtered : all} />
      </motion.main>

      {/* Floating Back to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="sf-back-to-top"
          aria-label="Back to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}

      {/* Modernized Column-based Footer */}
      <footer className="border-t border-white/8 bg-bg/60 mt-16">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="flex flex-col gap-3 col-span-2 md:col-span-1">
              <div className="flex items-center gap-2">
                <span className="font-display text-xl font-bold tracking-widest text-[#22c55e]">FYP</span>
              </div>
              <p className="text-xs text-muted leading-relaxed max-w-xs">
                Your premium portal for indie comics, spoiler-free lore assistants, and immersive digital reading.
              </p>
              <div className="flex items-center gap-3.5 mt-2 text-muted">
                <a href="#" className="hover:text-primary transition-colors" aria-label="Twitter"><Twitter className="h-4 w-4" /></a>
                <a href="#" className="hover:text-primary transition-colors" aria-label="Instagram"><Instagram className="h-4 w-4" /></a>
                <a href="#" className="hover:text-primary transition-colors" aria-label="Github"><Github className="h-4 w-4" /></a>
                <a href="#" className="hover:text-primary transition-colors" aria-label="Discord"><MessageSquare className="h-4 w-4" /></a>
              </div>
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
                <li><a href="#" className="hover:text-primary transition-colors">Blog News</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-4">Support</h4>
              <ul className="space-y-2.5 text-xs text-muted">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
            <div>© {new Date().getFullYear()} FYP. All rights reserved.</div>
            <div className="flex gap-4">
              <a href="/login" className="hover:text-primary transition-colors">Login</a>
              <span>•</span>
              <a href="/register" className="hover:text-primary transition-colors">Register</a>
            </div>
          </div>

          <div className="mt-8">
            <PWAInstallBanner />
          </div>
        </div>
      </footer>
    </div>
  );
}
