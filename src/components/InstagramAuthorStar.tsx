"use client";

import { useId } from "react";
import { cn } from "./cn";

export function InstagramAuthorStar({
  size = 18,
  className,
  title = "Top Author · Verified Star"
}: {
  size?: number;
  className?: string;
  title?: string;
}) {
  const gradientId = useId();

  return (
    <span
      className={cn("inline-flex items-center justify-center shrink-0 align-middle select-none", className)}
      title={title}
      aria-label={title}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_1px_3px_rgba(220,39,67,0.35)] transition-transform hover:scale-110"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f09433" />
            <stop offset="25%" stopColor="#e6683c" />
            <stop offset="50%" stopColor="#dc2743" />
            <stop offset="75%" stopColor="#cc2366" />
            <stop offset="100%" stopColor="#bc1888" />
          </linearGradient>
        </defs>
        {/* Instagram Scalloped Rosette Seal */}
        <path
          d="M22.5 12.5c0-1.58-.8-2.95-2-3.77.54-1.51.16-3.22-1.04-4.42-1.2-1.2-2.91-1.58-4.42-1.04-.82-1.2-2.19-2-3.77-2s-2.95.8-3.77 2c-1.51-.54-3.22-.16-4.42 1.04-1.2 1.2-1.58 2.91-1.04 4.42-1.2.82-2 2.19-2 3.77s.8 2.95 2 3.77c-.54 1.51-.16 3.22 1.04 4.42 1.2 1.2 2.91 1.58 4.42 1.04.82 1.2 2.19 2 3.77 2s2.95-.8 3.77-2c1.51.54 3.22.16 4.42-1.04 1.2-1.2 1.58-2.91 1.04-4.42 1.2-.82 2-2.19 2-3.77z"
          fill={`url(#${gradientId})`}
        />
        {/* Crisp Center 5-Point Star */}
        <polygon
          points="12,6.5 13.6,10 17.5,10.3 14.5,13.1 15.4,17 12,14.9 8.6,17 9.5,13.1 6.5,10.3 10.4,10"
          fill="#FFFFFF"
        />
      </svg>
    </span>
  );
}
