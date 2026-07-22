"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/Button";

export function Hero() {
  return (
    <section className="sf-comic-panel sf-comic-surface relative overflow-hidden rounded-3xl border border-white/8 bg-surface">
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(900px 500px at 20% 20%, rgba(255,51,102,0.28), transparent 60%), radial-gradient(900px 500px at 80% 10%, rgba(0,229,255,0.16), transparent 60%), radial-gradient(720px 460px at 72% 82%, rgba(255,193,7,0.12), transparent 64%), linear-gradient(180deg, rgba(0,0,0,0.16), rgba(0,0,0,0.72))"
        }}
      />

      {/* Ambient particles */}
      <div className="pointer-events-none absolute inset-0 opacity-25">
        <div className="absolute left-[8%] top-[25%] h-1.5 w-1.5 rounded-full bg-white blur-[1px]" />
        <div className="absolute left-[18%] top-[55%] h-1 w-1 rounded-full bg-primary blur-[1px]" />
        <div className="absolute left-[62%] top-[20%] h-1 w-1 rounded-full bg-highlight blur-[1px]" />
        <div className="absolute left-[75%] top-[65%] h-1.5 w-1.5 rounded-full bg-white blur-[1px]" />
      </div>

      <div className="relative px-6 py-10 md:px-10 md:py-14">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-display text-4xl tracking-widest text-white drop-shadow-[0_0_22px_rgba(255,51,102,0.2)] md:text-6xl"
        >
          Where reading meets cinema
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="mt-3 max-w-xl text-sm text-white/75 md:text-base"
        >
          Flip through webcomics with cinematic soundscapes, guided panel zoom, reactions, and a spoiler-safe
          Lore Master AI.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.16 }}
          className="mt-6 flex flex-wrap items-center gap-3"
        >
          <Link href="/series/s1">
            <Button variant="primary" size="lg">
              Start Reading
            </Button>
          </Link>
          <Link href="/series">
            <Button variant="outline" size="lg">
              Explore All Series
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
