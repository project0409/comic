"use client";

import { motion } from "framer-motion";

type MascotProps = {
  pose?: "idle" | "waving" | "pointing";
  className?: string;
};

export function GuideMascot({ pose = "idle", className }: MascotProps) {
  // Gentle breathing/sway animation mimicking a floating drone
  const swayAnimation = {
    y: [0, -6, 0],
    rotate: [0, 1.5, 0],
    transition: {
      duration: 3.2,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  };

  return (
    <motion.div
      className={className}
      animate={swayAnimation}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-[4px_8px_16px_rgba(0,0,0,0.35)]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Glowing visor and screen effect */}
          <filter id="cyan-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Neon Hover Ring (Bottom) */}
        <ellipse cx="50" cy="85" rx="22" ry="5.5" fill="none" stroke="#00e5ff" strokeWidth="2.5" filter="url(#cyan-glow)" opacity="0.9" />
        <ellipse cx="50" cy="85" rx="16" ry="4" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.6" />

        {/* 2. Hover Light Beam Rays */}
        <line x1="40" y1="80" x2="43" y2="70" stroke="#00e5ff" strokeWidth="1" opacity="0.4" strokeDasharray="2,2" />
        <line x1="50" y1="82" x2="50" y2="68" stroke="#00e5ff" strokeWidth="1.2" opacity="0.6" strokeDasharray="3,3" />
        <line x1="60" y1="80" x2="57" y2="70" stroke="#00e5ff" strokeWidth="1" opacity="0.4" strokeDasharray="2,2" />

        {/* 3. Arms / Hands */}
        {/* Left Arm (Relaxed/gently curved) */}
        <path d="M 37 60 Q 28 63 32 68" fill="none" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
        
        {/* Right Arm (Waving state) */}
        <path
          d="M 63 60 Q 72 58 74 48"
          fill="none"
          stroke="#1e293b"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Waving Hand ball */}
        <circle cx="74" cy="48" r="3.2" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />

        {/* 4. White Spherical Body */}
        <circle cx="50" cy="62" r="13.5" fill="#ffffff" stroke="#1e293b" strokeWidth="2.5" />
        {/* Body Details (Tummy Screen/Logo) */}
        <circle cx="50" cy="62" r="5" fill="#f1f5f9" />
        <circle cx="50" cy="62" r="2" fill="#cbd5e1" />

        {/* 5. Purple Scarf (Collar) */}
        <path
          d="M 35 50 C 35 50, 50 56, 65 50 C 61 55, 39 55, 35 50 Z"
          fill="#9333ea"
          stroke="#1e293b"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Scarf draped tails */}
        <path
          d="M 43 52 L 46 64 L 51 53"
          fill="#7e22ce"
          stroke="#1e293b"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* 6. Spherical Drone Head */}
        <rect x="25" y="21" width="50" height="33" rx="16.5" fill="#ffffff" stroke="#1e293b" strokeWidth="2.5" />

        {/* Ears/Side Antennas */}
        <rect x="21" y="29" width="4" height="15" rx="2" fill="#94a3b8" stroke="#1e293b" strokeWidth="1.8" />
        <rect x="75" y="29" width="4" height="15" rx="2" fill="#94a3b8" stroke="#1e293b" strokeWidth="1.8" />

        {/* Top Antenna */}
        <line x1="50" y1="21" x2="50" y2="13" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="50" cy="11" r="3.5" fill="#f59e0b" stroke="#1e293b" strokeWidth="2" />

        {/* 7. Dark Visor Screen */}
        <rect x="31" y="26" width="38" height="23" rx="11.5" fill="#0f172a" />

        {/* 8. Glowing Happy Visor Face details */}
        {/* Left Happy Curved Eye */}
        <path d="M 37 36 A 3.5 3.5 0 0 1 44 36" fill="none" stroke="#00e5ff" strokeWidth="2.5" strokeLinecap="round" filter="url(#cyan-glow)" />
        {/* Right Happy Curved Eye */}
        <path d="M 56 36 A 3.5 3.5 0 0 1 63 36" fill="none" stroke="#00e5ff" strokeWidth="2.5" strokeLinecap="round" filter="url(#cyan-glow)" />
        {/* Smile mouth */}
        <path d="M 47 42 Q 50 44 53 42" fill="none" stroke="#00e5ff" strokeWidth="1.8" strokeLinecap="round" filter="url(#cyan-glow)" />
      </svg>
    </motion.div>
  );
}
