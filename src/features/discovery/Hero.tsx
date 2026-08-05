"use client";

import Link from "@/compat/next-link";
import { Coins, TrendingUp, Play, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import type { Series } from "@/lib/types";

export function Hero({ trendingSeries, coinBalance }: { trendingSeries?: Series; coinBalance: number }) {
  return (
    <section className="sf-comic-panel sf-comic-surface relative overflow-hidden rounded-3xl border border-white/8 bg-surface">
      {/* Grid Pattern & Radial glow (Point 2 & 10) */}
      <div
        className="absolute inset-0 opacity-80"
        style={{
          backgroundImage: `
            radial-gradient(900px 500px at 15% 20%, rgba(139, 92, 246, 0.28), transparent 60%),
            radial-gradient(900px 500px at 85% 10%, rgba(6, 182, 212, 0.15), transparent 60%),
            radial-gradient(720px 460px at 72% 82%, rgba(251, 191, 36, 0.1), transparent 64%),
            radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: "auto, auto, auto, 24px 24px"
        }}
      />

      <div className="pointer-events-none absolute inset-0 opacity-25">
        <div className="absolute left-[8%] top-[25%] h-1.5 w-1.5 rounded-full bg-white blur-[1px]" />
        <div className="absolute left-[18%] top-[55%] h-1 w-1 rounded-full bg-primary blur-[1px]" />
        <div className="absolute left-[62%] top-[20%] h-1 w-1 rounded-full bg-highlight blur-[1px]" />
        <div className="absolute left-[75%] top-[65%] h-1.5 w-1.5 rounded-full bg-white blur-[1px]" />
      </div>

      <div className="relative grid gap-8 px-6 py-10 md:grid-cols-[1.2fr_0.8fr] md:px-10 md:py-12">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <Badge tone="gold" className="mb-4 gap-1.5 px-3 py-1.5 text-xs">
              Premium Comic Platform
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="font-display text-4xl font-extrabold tracking-tight text-white drop-shadow-sm md:text-6xl"
          >
            Welcome to FYP
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 max-w-xl text-sm leading-relaxed text-white/75 md:text-base"
          >
            Director&apos;s Cut comic reading experience with AI-powered recommendations, spoiler-safe
            assistance, creator tools, and immersive storytelling.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="mt-7 flex flex-wrap items-center gap-3"
          >
            <Link href="/read/c1">
              <Button variant="primary" size="lg" className="gap-2">
                <Play className="h-4 w-4 fill-white" />
                Read Demo Comic
              </Button>
            </Link>
            <Link href="#catalog">
              <Button variant="outline" size="lg" className="group gap-2">
                Explore Catalog
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>
        </div>

        <motion.aside
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col gap-4"
        >
          <div className="sf-comic-panel rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur-sm">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
              <TrendingUp className="h-4 w-4 text-primary" />
              Trending Series
            </div>

            {trendingSeries ? (
              <Link
                href={`/series/${trendingSeries.id}`}
                className="sf-clickable group flex items-center gap-3 rounded-xl border border-white/8 bg-white/5 p-3 transition hover:border-primary/35 hover:bg-white/8"
              >
                <div className="h-16 w-12 shrink-0 overflow-hidden rounded-lg">
                  <img
                    src={trendingSeries.coverUrl}
                    alt={trendingSeries.title}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                </div>
                <div className="min-w-0">
                  <div className="truncate font-semibold text-white group-hover:text-highlight">
                    {trendingSeries.title.split(":")[0]}
                  </div>
                  <div className="text-xs text-muted">{trendingSeries.genre}</div>
                </div>
              </Link>
            ) : null}
          </div>

          <div className="sf-comic-panel rounded-2xl border border-gold/25 bg-gold/10 p-4">
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold">
              <Coins className="h-4 w-4" />
              Available Balance
            </div>
            <div className="font-display text-3xl tracking-wide text-white">{coinBalance}</div>
            <div className="text-xs text-muted">Coins</div>
          </div>
        </motion.aside>
      </div>
    </section>
  );
}
