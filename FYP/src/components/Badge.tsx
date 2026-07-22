import { cn } from "./cn";

export function Badge({
  children,
  tone = "default",
  className
}: {
  children: React.ReactNode;
  tone?: "default" | "primary" | "gold" | "danger" | "muted";
  className?: string;
}) {
  const tones = {
    default: "bg-white/8 text-white/90 border-white/10",
    primary: "bg-primary/20 text-white border-primary/35 shadow-[0_0_18px_rgba(255,51,102,0.14)]",
    gold: "bg-gold/20 text-white border-gold/35 shadow-[0_0_18px_rgba(255,193,7,0.14)]",
    danger: "bg-danger/20 text-white border-danger/35 shadow-[0_0_18px_rgba(255,51,102,0.14)]",
    muted: "bg-white/7 text-muted border-white/12"
  };
  return (
    <span
      className={cn(
        "sf-comic-bubble inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold tracking-wide",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
