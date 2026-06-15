"use client";

import { useEffect, useMemo, useState } from "react";
import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { CarouselRow } from "./CarouselRow";
import type { Series } from "@/lib/types";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";
import { consumeAuthFlash } from "@/lib/authFlash";
import { useToastStore } from "@/store/toastStore";

export function HomePage() {
  const toast = useToastStore((s) => s.push);
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

  const trending = filtered.slice(0, 8);
  const newReleases = filtered.slice(2, 10);

  return (
    <div className="min-h-dvh">
      <Navbar
        onSearch={(query, g) => {
          setQ(query);
          setGenre(g);
        }}
      />

      <main className="mx-auto max-w-6xl space-y-10 px-4 py-6">
        <Hero />

        <div className="space-y-10" id="all">
          <CarouselRow title="🔥 Trending Now" items={trending} />
          <CarouselRow title="🆕 New Releases" items={newReleases} />

          {["Action", "Romance", "Horror", "Mystery", "Fantasy"].map((g) => (
            <CarouselRow key={g} title={g} items={filtered.filter((s) => s.genre === g)} />
          ))}
        </div>
      </main>

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
        <div className="mx-auto max-w-6xl px-4 pb-10">
          <PWAInstallBanner />
        </div>
      </footer>
    </div>
  );
}
