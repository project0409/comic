"use client";

import { motion } from "framer-motion";
import type { Series } from "@/lib/types";
import { CatalogSeriesCard } from "./CatalogSeriesCard";

export function SeriesCatalog({ series, activeGenre }: { series: Series[]; activeGenre?: string }) {
  return (
    <motion.section
      className="space-y-5"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.38, ease: "easeOut" }}
      id="catalog"
    >
      <div>
        <h2 className="font-display text-2xl tracking-wider text-white">
          {activeGenre ? `${activeGenre} Comics` : "Series Catalog"}
        </h2>
        <div className="mt-1 text-sm text-muted">
          {activeGenre ? `Showing comics in ${activeGenre}.` : "All comics from every category."}
        </div>
      </div>

      <div className="space-y-4">
        {series.length === 0 ? (
          <div className="sf-comic-panel rounded-2xl border border-white/10 bg-surface/60 p-8 text-center text-sm text-muted">
            No series found for this filter.
          </div>
        ) : (
          series.map((s) => <CatalogSeriesCard key={s.id} series={s} />)
        )}
      </div>
    </motion.section>
  );
}
