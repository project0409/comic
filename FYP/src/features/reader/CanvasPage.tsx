"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/components/cn";
import { useUiStore } from "@/store/uiStore";

type Point = [number, number];

type PanelTheme = {
  page: string;
  panel: string;
  stroke: string;
  glow: string;
  imageAlpha: number;
  overlay: string;
  flipGlow: string;
};

type PageMetrics = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type PanelBounds = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  centerX: number;
  centerY: number;
};

type RenderState = {
  img: HTMLImageElement;
  w: number;
  h: number;
  theme: "dark" | "light";
};

const PANEL_TEMPLATE: Point[][] = [
  [
    [0.02, 0.02],
    [0.64, 0.02],
    [0.47, 0.49],
    [0.02, 0.40]
  ],
  [
    [0.66, 0.02],
    [0.98, 0.02],
    [0.98, 0.58],
    [0.49, 0.49]
  ],
  [
    [0.02, 0.43],
    [0.47, 0.52],
    [0.47, 0.98],
    [0.02, 0.98]
  ],
  [
    [0.49, 0.53],
    [0.98, 0.62],
    [0.98, 0.98],
    [0.49, 0.98]
  ]
];

function getPanelTheme(theme: "dark" | "light"): PanelTheme {
  if (theme === "light") {
    return {
      page: "#fbfdff",
      panel: "#ffffff",
      stroke: "#111827",
      glow: "rgba(16, 32, 51, 0.16)",
      imageAlpha: 0.14,
      overlay: "rgba(255, 255, 255, 0.62)",
      flipGlow: "rgba(0, 168, 200, 0.2)"
    };
  }

  return {
    page: "#090b12",
    panel: "#111522",
    stroke: "rgba(255, 255, 255, 0.88)",
    glow: "rgba(0, 229, 255, 0.2)",
    imageAlpha: 0.32,
    overlay: "rgba(8, 10, 18, 0.2)",
    flipGlow: "rgba(255, 51, 102, 0.28)"
  };
}

function getPageMetrics(w: number, h: number): PageMetrics {
  const margin = Math.max(6, Math.min(w, h) * 0.025);
  return {
    x: margin,
    y: margin,
    width: Math.max(2, w - margin * 2),
    height: Math.max(2, h - margin * 2)
  };
}

function polygonPath(points: Point[], metrics: PageMetrics) {
  const path = new Path2D();
  points.forEach(([px, py], index) => {
    const ax = metrics.x + px * metrics.width;
    const ay = metrics.y + py * metrics.height;
    if (index === 0) path.moveTo(ax, ay);
    else path.lineTo(ax, ay);
  });
  path.closePath();
  return path;
}

function panelBounds(points: Point[], metrics: PageMetrics): PanelBounds {
  const xs = points.map(([px]) => metrics.x + px * metrics.width);
  const ys = points.map(([, py]) => metrics.y + py * metrics.height);
  const left = Math.min(...xs);
  const right = Math.max(...xs);
  const top = Math.min(...ys);
  const bottom = Math.max(...ys);
  return {
    left,
    top,
    right,
    bottom,
    centerX: (left + right) / 2,
    centerY: (top + bottom) / 2
  };
}

function drawImageCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, width: number, height: number) {
  const scale = Math.max(width / img.width, height / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  const dx = x + (width - dw) / 2;
  const dy = y + (height - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
}

function drawPanelImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  metrics: PageMetrics,
  bounds: PanelBounds,
  index: number,
  theme: PanelTheme,
  flipProgress?: number
) {
  const flipScale = flipProgress == null ? 1 : Math.max(0.08, Math.abs(Math.cos(flipProgress * Math.PI)));

  ctx.save();
  if (flipProgress != null) {
    ctx.translate(bounds.centerX, bounds.centerY);
    ctx.scale(flipScale, 1);
    ctx.translate(-bounds.centerX, -bounds.centerY);
  }
  ctx.globalAlpha = theme.imageAlpha;
  drawImageCover(ctx, img, metrics.x - index * metrics.width * 0.06, metrics.y, metrics.width * 1.12, metrics.height);
  ctx.globalAlpha = 1;
  ctx.fillStyle = theme.overlay;
  ctx.fillRect(metrics.x, metrics.y, metrics.width, metrics.height);
  ctx.restore();
}

function drawComicTemplate(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number,
  theme: "dark" | "light",
  flipPanelIndex?: number,
  flipProgress?: number
) {
  const panelTheme = getPanelTheme(theme);
  const metrics = getPageMetrics(w, h);

  ctx.save();
  ctx.fillStyle = theme === "light" ? "#eaf4ff" : "#050711";
  ctx.fillRect(0, 0, w, h);

  ctx.shadowColor = panelTheme.glow;
  ctx.shadowBlur = theme === "light" ? 22 : 34;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = panelTheme.page;
  ctx.fillRect(metrics.x, metrics.y, metrics.width, metrics.height);
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = panelTheme.stroke;
  ctx.lineWidth = Math.max(4, Math.min(metrics.width, metrics.height) * 0.009);
  ctx.lineJoin = "miter";
  ctx.lineCap = "square";

  PANEL_TEMPLATE.forEach((points, index) => {
    const path = polygonPath(points, metrics);
    const bounds = panelBounds(points, metrics);
    const isFlipping = flipPanelIndex === index && flipProgress != null;

    ctx.save();
    ctx.fillStyle = panelTheme.panel;
    ctx.fill(path);
    ctx.clip(path);
    drawPanelImage(ctx, img, metrics, bounds, index, panelTheme, isFlipping ? flipProgress : undefined);
    ctx.restore();

    if (isFlipping) {
      ctx.save();
      ctx.strokeStyle = panelTheme.flipGlow;
      ctx.lineWidth = Math.max(8, Math.min(metrics.width, metrics.height) * 0.016);
      ctx.stroke(path);
      ctx.restore();
    }

    ctx.stroke(path);
  });

  ctx.strokeStyle = panelTheme.stroke;
  ctx.lineWidth = Math.max(4, Math.min(metrics.width, metrics.height) * 0.008);
  ctx.strokeRect(metrics.x, metrics.y, metrics.width, metrics.height);
  ctx.restore();
}

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
  const renderStateRef = useRef<RenderState | null>(null);
  const frameRef = useRef<number | null>(null);
  const resolvedTheme = useUiStore((s) => s.resolvedTheme);

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
      renderStateRef.current = { img, w, h, theme: resolvedTheme };
      drawComicTemplate(ctx, img, w, h, resolvedTheme);
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
      ctx.fillStyle = resolvedTheme === "light" ? "#eef6ff" : "#080a12";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = resolvedTheme === "light" ? "#102033" : "rgba(255,255,255,0.72)";
      ctx.font = "600 14px system-ui";
      ctx.fillText("Failed to load page image.", 16, 24);
    };
    img.src = src;

    return () => {
      cancelled = true;
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    };
  }, [src, onReady, resolvedTheme]);

  function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const state = renderStateRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !state) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const metrics = getPageMetrics(state.w, state.h);
    const panelIndex = PANEL_TEMPLATE.findIndex((points) => ctx.isPointInPath(polygonPath(points, metrics), x, y));
    if (panelIndex < 0) return;

    const startedAt = performance.now();
    const duration = 520;
    if (frameRef.current) window.cancelAnimationFrame(frameRef.current);

    const animate = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      ctx.clearRect(0, 0, state.w, state.h);
      drawComicTemplate(ctx, state.img, state.w, state.h, state.theme, panelIndex, progress);
      if (progress < 1) {
        frameRef.current = window.requestAnimationFrame(animate);
        return;
      }
      frameRef.current = null;
      drawComicTemplate(ctx, state.img, state.w, state.h, state.theme);
    };

    frameRef.current = window.requestAnimationFrame(animate);
  }

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        "sf-no-select block h-full w-full rounded-xl shadow-[0_18px_48px_rgba(0,0,0,0.42)] transition-[filter,transform] duration-300 hover:brightness-105",
        className
      )}
      onClick={handleClick}
      onContextMenu={(e) => e.preventDefault()}
    />
  );
}