"use client";

import { motion } from "framer-motion";

export function InteractiveBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* base image */}
      <div
        className="absolute inset-0 opacity-[0.34]"
        style={{
          backgroundImage: "url(/backgrounds/dark-fantasy-fixed-bg.png)",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundAttachment: "fixed"
        }}
      />

      {/* animated glow blobs */}
      <motion.div
        className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(124,58,237,0.40), transparent 60%)"
        }}
        animate={{ x: [0, 60, 0], y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-48 top-32 h-[560px] w-[560px] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 40% 40%, rgba(245,158,11,0.22), transparent 62%)"
        }}
        animate={{ x: [0, -70, 0], y: [0, 40, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* subtle panel grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.20]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(255,255,255,0.055) 0px, rgba(255,255,255,0.055) 1px, transparent 1px, transparent 18px)"
        }}
      />
    </div>
  );
}
