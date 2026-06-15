"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/components/cn";

export function CanvasPage({
  src,
  className,
  onReady
}: {
  src: string;
  className?: string;
  onReady?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (cancelled) return;
      const parent = canvas.parentElement;
      const w = parent?.clientWidth ?? 800;
      const h = parent?.clientHeight ?? Math.round(w * 1.33);
      canvas.width = Math.max(2, Math.floor(w * devicePixelRatio));
      canvas.height = Math.max(2, Math.floor(h * devicePixelRatio));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // contain
      const scale = Math.min(w / img.width, h / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      const dx = (w - dw) / 2;
      const dy = (h - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);
      onReady?.();
    };
    img.onerror = () => {
      if (cancelled) return;
      const parent = canvas.parentElement;
      const w = parent?.clientWidth ?? 800;
      const h = parent?.clientHeight ?? Math.round(w * 1.33);
      canvas.width = Math.max(2, Math.floor(w * devicePixelRatio));
      canvas.height = Math.max(2, Math.floor(h * devicePixelRatio));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = "600 14px system-ui";
      ctx.fillText("Failed to load page image.", 16, 24);
    };
    img.src = src;

    return () => {
      cancelled = true;
    };
  }, [src, onReady]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("sf-no-select block h-full w-full", className)}
      onContextMenu={(e) => e.preventDefault()}
    />
  );
}

