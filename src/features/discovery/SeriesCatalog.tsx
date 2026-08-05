"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { Series } from "@/lib/types";
import { cn } from "@/components/cn";
import { CatalogSeriesCard } from "./CatalogSeriesCard";

const CATALOG_GENRES = ["All", "Sci-Fi", "Fantasy", "Action"] as const;

export function SeriesCatalog({ series }: { series: Series[] }) {
  const [genre, setGenre] = useState<(typeof CATALOG_GENRES)[number]>("All");

  const filtered = useMemo(() => {
    if (genre === "All") return series;
    return series.filter((s) => s.genre === genre);
  }, [series, genre]);

  return (
    <motion.section
      className="space-y-5"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.38, ease: "easeOut" }}
      id="catalog"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="font-display text-2xl tracking-wider text-white">Series Catalog</h2>

        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Catalog genre filters">
          {CATALOG_GENRES.map((g) => {
            const active = genre === g;
            return (
              <button
                key={g}
                role="tab"
                aria-selected={active}
                onClick={() => setGenre(g)}
                className={cn(
                  "sf-clickable rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition",
                    active
                      ? "border-primary/45 bg-primary/18 text-white shadow-sm"
                      : "border-white/10 bg-white/5 text-muted hover:bg-white/8 hover:text-white"
                )}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="sf-comic-panel rounded-2xl border border-white/10 bg-surface/60 p-8 text-center text-sm text-muted">
            No series found in this genre.
          </div>
        ) : (
          filtered.map((s) => <CatalogSeriesCard key={s.id} series={s} />)
        )}
      </div>
    </motion.section>
  );
}
