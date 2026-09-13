"use client";

import { useRef } from "react";
import Link from "@/compat/next-link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Users, BookOpen, ArrowRight } from "lucide-react";
import { InstagramAuthorStar } from "@/components/InstagramAuthorStar";
import { cn } from "@/components/cn";
import type { EnrichedAuthor } from "@/lib/trending";

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return `${n}`;
}

export function TopAuthorsRow({ authors }: { authors: EnrichedAuthor[] }) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft } = scrollRef.current;
      const offset = direction === "left" ? -300 : 300;
      scrollRef.current.scrollTo({ left: scrollLeft + offset, behavior: "smooth" });
    }
  };

  if (!authors || authors.length === 0) return null;

  return (
    <motion.section
      className="space-y-4"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.38, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold tracking-wide text-white">
            Top Authors
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Discover and follow the most-read indie creators on FYP
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1.5 sm:flex">
            <button
              onClick={() => handleScroll("left")}
              className="sf-clickable grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-white/5 text-muted hover:border-primary/30 hover:bg-white/8 hover:text-white"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleScroll("right")}
              className="sf-clickable grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-white/5 text-muted hover:border-primary/30 hover:bg-white/8 hover:text-white"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="text-xs text-muted">{authors.length} authors</div>
        </div>
      </div>

      <motion.div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 pt-2 -mt-2 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        initial={{ opacity: 0, y: 6 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35 }}
      >
        {authors.map((author) => (
          <motion.div
            key={author.id}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.25 }}
            className="shrink-0 w-[240px] sm:w-[260px]"
          >
            <div className="sf-comic-panel sf-comic-surface group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-card p-4 transition-all duration-300 hover:border-primary/40 hover:shadow-[0_12px_28px_rgba(255,51,102,0.12)] h-full">
              {/* Header: Avatar & Name */}
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "shrink-0 rounded-2xl overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105",
                    author.isTopAuthor
                      ? "p-[2px] bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]"
                      : "border border-white/20 bg-black/40 p-1"
                  )}
                >
                  <div className="h-12 w-12 rounded-[14px] bg-black/60 flex items-center justify-center overflow-hidden">
                    <img
                      src={author.avatarUrl}
                      alt={author.name}
                      className="h-full w-full object-contain"
                      loading="lazy"
                    />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-semibold text-white truncate text-sm group-hover:text-primary transition-colors">
                      {author.name}
                    </h3>
                    {author.isTopAuthor && (
                      <InstagramAuthorStar size={14} title="Top Author" />
                    )}
                  </div>
                  <div className="text-[11px] text-muted truncate">
                    {author.genres.length > 0 ? author.genres.join(", ") : "Creator"}
                  </div>
                </div>
              </div>

              {/* Bio snippet */}
              <p className="mt-3 text-xs text-muted/90 line-clamp-2 leading-relaxed">
                {author.bio || "No description available yet."}
              </p>

              {/* Real statistics row */}
              <div className="mt-3 pt-3 border-t border-white/8 grid grid-cols-3 gap-1 text-center">
                <div>
                  <div className="text-xs font-bold text-white">
                    {author.comicCount}
                  </div>
                  <div className="text-[10px] text-muted">Comics</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-white">
                    {formatCount(author.totalReaders)}
                  </div>
                  <div className="text-[10px] text-muted">Readers</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-white">
                    {formatCount(author.followerCount)}
                  </div>
                  <div className="text-[10px] text-muted">Followers</div>
                </div>
              </div>

              {/* View Profile Action */}
              <Link
                href={`/author/${author.id}`}
                className="mt-3.5 inline-flex items-center justify-center gap-1.5 w-full rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-semibold text-white hover:bg-white/10 hover:border-primary/40 hover:text-primary transition-all"
              >
                <span>View Profile</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}
