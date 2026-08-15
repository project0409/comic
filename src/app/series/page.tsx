"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "@/compat/next-link";
import { motion } from "framer-motion";
import { useSearchParams } from "@/compat/next-navigation";
import { Navbar } from "@/features/discovery/Navbar";
import { SeriesCard } from "@/features/discovery/SeriesCard";
import type { Series } from "@/lib/types";
import { Button } from "@/components/Button";
import { chaptersBySeries } from "@/lib/mockData";

export default function AllSeriesPage() {
  return (
    <Suspense fallback={null}>
      <SeriesPageContent />
    </Suspense>
  );
}

function SeriesPageContent() {
  const searchParams = useSearchParams();
  const [all, setAll] = useState<Series[]>([]);
  const [q, setQ] = useState("");
  const [genre, setGenre] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetch("/api/series")
      .then((r) => r.json())
      .then(setAll)
      .catch(() => setAll([]));
  }, []);

  useEffect(() => {
    setQ(searchParams.get("q") ?? "");
    setGenre(searchParams.get("genre") ?? undefined);
  }, [searchParams]);

  const filtered = useMemo(() => {
    return all.filter((s) => {
      const query = q.trim().toLowerCase();
      const chapterText = (chaptersBySeries[s.id] ?? []).map((chapter) => chapter.title).join(" ").toLowerCase();
      const keywordText = (s.searchKeywords ?? []).join(" ").toLowerCase();
      const matchQ = query
        ? [s.title, s.writerName, s.genre, s.description].some((value) => value.toLowerCase().includes(query)) ||
          keywordText.includes(query) ||
          chapterText.includes(query)
        : true;
      const matchG = genre ? s.genre === genre : true;
      return matchQ && matchG;
    });
  }, [all, q, genre]);

  const heading = genre ? `${genre} Comics` : "All Series";
  const helper = genre ? `Showing comics in ${genre}.` : "Explore everything in FYP";

  return (
    <div className="min-h-dvh">
      <Navbar
        searchValue={q}
        genreValue={genre}
        seriesOptions={all}
        onSearch={(query, g) => {
          setQ(query);
          setGenre(g);
        }}
      />

      <motion.main
        className="mx-auto max-w-6xl space-y-6 px-4 py-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, ease: "easeOut" }}
      >
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="font-display text-4xl tracking-widest drop-shadow-[0_0_16px_rgba(255,51,102,0.16)]">
              {heading}
            </div>
            <div className="text-sm text-muted">{helper}</div>
          </div>
          <div className="flex gap-2">
            <Link href="/discover">
              <Button variant="outline">Back</Button>
            </Link>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="sf-comic-panel sf-comic-surface rounded-3xl border border-white/10 bg-card p-6 text-sm text-muted">
            No series found for this filter.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
            {filtered.map((s) => (
              <SeriesCard key={s.id} series={s} />
            ))}
          </div>
        )}
      </motion.main>
    </div>
  );
}
