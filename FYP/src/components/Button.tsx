"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "./cn";

type Variant = "primary" | "outline" | "ghost" | "danger" | "gold";
type Size = "sm" | "md" | "lg";

type ButtonProps = HTMLMotionProps<"button"> & {
  variant?: Variant;
  size?: Size;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold tracking-wide transition-[transform,box-shadow,background-color,border-color,color,filter] duration-300 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer";

  const byVariant: Record<Variant, string> = {
    primary:
      "bg-[linear-gradient(135deg,var(--sf-primary),var(--sf-highlight))] text-white shadow-glow hover:brightness-110 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.18),0_0_34px_rgba(255,51,102,0.34)]",
    outline:
      "border border-white/14 bg-white/[0.06] text-white/90 backdrop-blur-xl hover:border-primary/45 hover:bg-primary/10 hover:text-white hover:shadow-[0_0_24px_rgba(255,51,102,0.16)]",
    ghost: "bg-transparent text-white/80 hover:bg-white/7 hover:text-white",
    danger:
      "bg-[linear-gradient(135deg,var(--sf-danger),var(--sf-primary))] text-white hover:brightness-110 hover:shadow-[0_0_28px_rgba(255,51,102,0.28)]",
    gold:
      "bg-[linear-gradient(135deg,var(--sf-gold),#ffe082)] text-black hover:brightness-105 hover:shadow-[0_0_30px_rgba(255,193,7,0.28)]"
  };

  const bySize: Record<Size, string> = {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-4 text-sm",
    lg: "h-12 px-5 text-base"
  };

  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.96 }}
      whileHover={{ y: -2, scale: 1.015 }}
      className={cn(base, byVariant[variant], bySize[size], className)}
      {...props}
    />
  );
}
