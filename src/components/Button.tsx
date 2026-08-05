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
    primary: "sf-button-primary",
    outline: "sf-button-outline",
    ghost: "sf-button-ghost",
    danger: "sf-button-danger",
    gold: "sf-button-gold"
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
      transition={{ duration: 0.2 }}
      className={cn(base, byVariant[variant], bySize[size], className)}
      {...props}
    />
  );
}
