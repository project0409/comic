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
    primary: "bg-primary/20 text-white border-primary/30",
    gold: "bg-gold/20 text-white border-gold/30",
    danger: "bg-danger/20 text-white border-danger/30",
    muted: "bg-white/6 text-muted border-white/10"
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

