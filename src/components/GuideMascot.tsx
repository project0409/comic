"use client";

import { motion } from "framer-motion";

type MascotProps = {
  pose?: "idle" | "waving" | "pointing";
  className?: string;
};

export function GuideMascot({ pose = "idle", className }: MascotProps) {
  const isWaving = pose === "waving";
  const isPointing = pose === "pointing";

  // Eyes blink loop
  const eyeBlink = {
    scaleY: [1, 1, 0.1, 1, 1],
    transition: {
      duration: 4.5,
      repeat: Infinity,
      repeatDelay: 3.5,
      ease: "easeInOut" as const
    }
  };

  // Gentle breathing/sway animation
  const swayAnimation = {
    y: [0, -3, 0],
    rotate: [0, 1.5, 0],
    transition: {
      duration: 4,
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
        className="w-full h-full drop-shadow-[4px_8px_12px_rgba(0,0,0,0.3)]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Hair gradients */}
          <linearGradient id="hair-base" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4a332d" /> {/* Dark brown */}
            <stop offset="100%" stopColor="#6e4f44" /> {/* Medium brown */}
          </linearGradient>
          <linearGradient id="hair-highlight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8d685c" />
            <stop offset="100%" stopColor="#bfa397" />
          </linearGradient>

          {/* Eye gradients */}
          <radialGradient id="eye-iris" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e1310" />
            <stop offset="60%" stopColor="#50352a" />
            <stop offset="100%" stopColor="#966e5f" />
          </radialGradient>

          {/* Hoodie gradient */}
          <linearGradient id="hoodie-dark" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>

        {/* Pink Manga Accent Sparks (Above head, top left) */}
        <g opacity="0.9">
          <path d="M 22 14 L 18 4" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 31 16 L 29 6" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 39 20 L 38 10" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* Back Hoodie Hood */}
        <path
          d="M 28 50 C 24 50, 20 62, 24 72 C 26 76, 32 80, 42 78"
          fill="#0f172a"
          stroke="#1c1917"
          strokeWidth="1.8"
        />

        {/* Back Spiky Hair Layers */}
        <path
          d="M 24 40 L 16 38 L 22 34 L 15 28 L 24 26 L 22 18 L 32 20 L 35 12 L 44 18 Z"
          fill="url(#hair-base)"
          stroke="#1c1917"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />

        {/* Chibi Face / Head Base */}
        <path
          d="M 30 42 C 30 30, 64 28, 66 42 C 67 48, 64 56, 52 56 C 40 56, 30 49, 30 42 Z"
          fill="#ffdcc8"
          stroke="#1c1917"
          strokeWidth="1.8"
        />

        {/* Rosy blush cheeks */}
        <ellipse cx="38" cy="48" rx="3.5" ry="1.8" fill="#f43f5e" opacity="0.38" />
        <ellipse cx="58" cy="48" rx="3.5" ry="1.8" fill="#f43f5e" opacity="0.38" />

        {/* Large Shiny Brown Anime Eyes (Blinking) */}
        <g>
          {/* Left Eye */}
          <ellipse cx="40" cy="43" rx="4.5" ry="6" fill="#1e1917" />
          <motion.ellipse
            cx="40"
            cy="43"
            rx="4.2"
            ry="5.8"
            fill="url(#eye-iris)"
            animate={eyeBlink}
            style={{ originX: "40px", originY: "43px" }}
          />
          {/* Pupil & highlights */}
          <circle cx="41.8" cy="40.5" r="1.5" fill="white" />
          <circle cx="38.5" cy="45.5" r="0.7" fill="white" />
          {/* Eyelashes/Border */}
          <path d="M 35 40 Q 40 37 45 40" fill="none" stroke="#1c1917" strokeWidth="2.2" strokeLinecap="round" />

          {/* Right Eye */}
          <ellipse cx="58" cy="43" rx="4.5" ry="6" fill="#1e1917" />
          <motion.ellipse
            cx="58"
            cy="43"
            rx="4.2"
            ry="5.8"
            fill="url(#eye-iris)"
            animate={eyeBlink}
            style={{ originX: "58px", originY: "43px" }}
          />
          {/* Pupil & highlights */}
          <circle cx="59.8" cy="40.5" r="1.5" fill="white" />
          <circle cx="56.5" cy="45.5" r="0.7" fill="white" />
          {/* Eyelashes/Border */}
          <path d="M 53 40 Q 58 37 63 40" fill="none" stroke="#1c1917" strokeWidth="2.2" strokeLinecap="round" />
        </g>

        {/* Eyebrows */}
        <path d="M 35 36 Q 40 34 43 37" fill="none" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M 55 36 Q 58 34 63 37" fill="none" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" />

        {/* Happy Smile Mouth */}
        <path
          d="M 46 49 Q 49 53 52 49"
          fill="none"
          stroke="#1c1917"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Front Messy Hair Bangs (over face) */}
        <g>
          {/* Base spiky bangs shape */}
          <path
            d="M 28 35 
               Q 30 38 33 39 
               Q 36 34 38 31 
               Q 41 39 44 41 
               Q 46 36 48 30
               Q 51 40 54 41
               Q 57 35 60 31
               Q 62 38 65 37
               L 66 18 Q 48 12 28 26 Z"
            fill="url(#hair-base)"
            stroke="#1c1917"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          {/* Hair highlights/sheen */}
          <path
            d="M 32 23 Q 48 16 62 23 M 36 26 Q 48 20 58 26"
            fill="none"
            stroke="url(#hair-highlight)"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.8"
          />
        </g>

        {/* Hoodie Coat Body */}
        <path
          d="M 27 60 C 27 60, 31 82, 50 82 C 69 82, 70 60, 70 60 Z"
          fill="url(#hoodie-dark)"
          stroke="#1c1917"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />

        {/* Hoodie zip & drawstring detail */}
        <path d="M 48 62 L 48 82" stroke="#1c1917" strokeWidth="1.5" />
        <path d="M 45 61 Q 48 64 51 61" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
        
        {/* Drawstrings */}
        <path d="M 44 63 L 42 74" fill="none" stroke="#f43f5e" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M 52 63 L 54 74" fill="none" stroke="#f43f5e" strokeWidth="1.8" strokeLinecap="round" />

        {/* LEFT HAND (top-right in SVG space, grabbing card edge) */}
        <g>
          {/* Sleeve cuff */}
          <path d="M 58 56 Q 64 54 66 58" fill="#1e293b" stroke="#1c1917" strokeWidth="1.5" />
          {/* Small peach fingers overlapping card edge */}
          <ellipse cx="68" cy="58" rx="3.5" ry="2.5" fill="#ffdcc8" stroke="#1c1917" strokeWidth="1.5" />
          <ellipse cx="69" cy="61" rx="3" ry="2" fill="#ffdcc8" stroke="#1c1917" strokeWidth="1.5" />
        </g>

        {/* RIGHT HAND (bottom-right in SVG space, grabbing card edge) */}
        <g>
          {/* Sleeve cuff */}
          <path d="M 58 72 Q 64 70 66 74" fill="#1e293b" stroke="#1c1917" strokeWidth="1.5" />
          {/* Small peach fingers overlapping card edge */}
          <ellipse cx="68" cy="74" rx="3.5" ry="2.5" fill="#ffdcc8" stroke="#1c1917" strokeWidth="1.5" />
          <ellipse cx="69" cy="77" rx="3" ry="2" fill="#ffdcc8" stroke="#1c1917" strokeWidth="1.5" />
        </g>
      </svg>
    </motion.div>
  );
}
