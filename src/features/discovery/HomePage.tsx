"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { StatsBar } from "./StatsBar";
import { ReleaseCalendar } from "./ReleaseCalendar";
import { SeriesCatalog } from "./SeriesCatalog";
import { CarouselRow } from "./CarouselRow";
import type { Series } from "@/lib/types";
import { releaseCalendar } from "@/lib/mockData";
import { consumeAuthFlash } from "@/lib/authFlash";
import { useToastStore } from "@/store/toastStore";
import { useWalletStore } from "@/store/walletStore";

export function HomePage() {
  const toast = useToastStore((s) => s.push);
  const coinBalance = useWalletStore((s) => s.coinBalance);
  const [all, setAll] = useState<Series[]>([]);
  const [q, setQ] = useState("");
  const [genre, setGenre] = useState<string | undefined>(undefined);

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
    <div className="min-h-dvh">
      <Navbar
        onSearch={(query, g) => {
          setQ(query);
          setGenre(g);
        }}
      />

      <motion.main
        className="mx-auto max-w-6xl space-y-10 px-4 py-6"
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

      <footer className="border-t border-white/8 bg-bg/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <span className="font-display tracking-widest">FYP</span>
            <span className="text-xs">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex flex-wrap gap-4 text-xs">
            <a className="hover:text-white" href="/vault">
              Vault
            </a>
            <a className="hover:text-white" href="/wallet">
              Wallet
            </a>
            <a className="hover:text-white" href="/login">
              Login
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
