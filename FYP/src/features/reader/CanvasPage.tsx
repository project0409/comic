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

      // Use the current comic page itself as a soft backdrop for the extra space around the contained page.
      const coverScale = Math.max(w / img.width, h / img.height);
      const coverW = img.width * coverScale;
      const coverH = img.height * coverScale;
      const coverX = (w - coverW) / 2;
      const coverY = (h - coverH) / 2;

      ctx.save();
      ctx.filter = "blur(18px) brightness(0.45) saturate(1.18)";
      ctx.globalAlpha = 0.82;
      ctx.drawImage(img, coverX, coverY, coverW, coverH);
      ctx.restore();

      const wash = ctx.createLinearGradient(0, 0, w, h);
      wash.addColorStop(0, "rgba(255,51,102,0.12)");
      wash.addColorStop(0.48, "rgba(8,10,18,0.36)");
      wash.addColorStop(1, "rgba(0,229,255,0.1)");
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, w, h);

      // Main page stays contained and readable.
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
      className={cn(
        "sf-no-select block h-full w-full rounded-xl shadow-[0_18px_48px_rgba(0,0,0,0.42)] transition-[filter,transform] duration-300 hover:brightness-105",
        className
      )}
      onContextMenu={(e) => e.preventDefault()}
    />
  );
}
