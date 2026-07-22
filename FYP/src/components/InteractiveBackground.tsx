"use client";

import { motion } from "framer-motion";

export function InteractiveBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* CSS-only comic atmosphere */}
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(760px 460px at 10% 8%, rgba(255,51,102,0.26), transparent 64%), radial-gradient(720px 440px at 88% 16%, rgba(0,229,255,0.17), transparent 62%), radial-gradient(820px 520px at 70% 88%, rgba(255,193,7,0.13), transparent 66%), linear-gradient(180deg, #080a12, #121826 54%, #070912)"
        }}
        animate={{ opacity: [0.62, 0.78, 0.62] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute left-[8%] top-[18%] h-48 w-48 rounded-[42%] border border-primary/18 bg-primary/[0.06] blur-[0.2px]"
        animate={{ y: [0, -12, 0], rotate: [0, 4, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[9%] top-[22%] h-56 w-56 rounded-[38%] border border-highlight/18 bg-highlight/[0.055]"
        animate={{ y: [0, 14, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[8%] left-[56%] h-40 w-72 -skew-x-12 rounded-[32px] border border-gold/16 bg-gold/[0.045]"
        animate={{ x: [0, 18, 0], opacity: [0.55, 0.78, 0.55] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* subtle panel grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.22]"
        style={{
          background:
            "radial-gradient(circle at 1px 1px, rgba(255,193,7,0.16) 1px, transparent 0), repeating-linear-gradient(135deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 18px)",
          backgroundSize: "26px 26px, auto"
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.24]"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,51,102,0.12), transparent 28%, rgba(0,229,255,0.09) 72%, transparent)"
        }}
      />
    </div>
  );
}
