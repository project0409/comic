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
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

  const byVariant: Record<Variant, string> = {
    primary: "bg-primary text-black hover:bg-[color-mix(in_srgb,var(--sf-primary)_85%,white)] shadow-glow",
    outline: "border border-white/12 bg-transparent hover:bg-white/5",
    ghost: "bg-transparent hover:bg-white/5",
    danger: "bg-danger text-black hover:bg-[color-mix(in_srgb,var(--sf-danger)_85%,white)]",
    gold: "bg-gold text-black hover:bg-[color-mix(in_srgb,var(--sf-gold)_85%,white)]"
  };

  const bySize: Record<Size, string> = {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-4 text-sm",
    lg: "h-12 px-5 text-base"
  };

  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -1 }}
      className={cn(base, byVariant[variant], bySize[size], className)}
      {...props}
    />
  );
}
