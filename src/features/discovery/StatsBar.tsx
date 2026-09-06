"use client";

import { Sparkles, Star, BookOpen, Users } from "lucide-react";
import { motion } from "framer-motion";
import { platformStats } from "@/lib/mockData";
import { cn } from "@/components/cn";

export function StatsBar() {
  const stats = [
    {
      icon: Sparkles,
      label: "Comic Catalog",
      value: "100%",
      suffix: "Free Access",
      accent: "text-purple-400 bg-purple-500/10 border-purple-500/20",
      growth: "No Paywalls"
    },
    {
      icon: Star,
      label: "Avg Rating Score",
      value: `${platformStats.avgRating}`,
      suffix: "/ 5.0",
      accent: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
      growth: "↑ 8.3%"
    },
    {
      icon: BookOpen,
      label: "Monthly Reads",
      value: `${Math.floor(platformStats.monthlyReads / 1000)}K+`,
      suffix: "",
      accent: "text-rose-400 bg-rose-500/10 border-rose-500/20",
      growth: "↑ 15.7%"
    },
    {
      icon: Users,
      label: "Active Creators",
      value: `${platformStats.activeCreators}`,
      suffix: "Indie",
      accent: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      growth: "↑ 0.2%"
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="sf-comic-panel sf-comic-surface rounded-2xl border border-white/10 bg-surface/80 p-5 hover:border-primary/20 transition-all duration-300"
          >
            <div className="mb-4 flex items-center justify-between gap-2">
              <div className={cn("grid h-9 w-9 place-items-center rounded-full border", stat.accent)}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted text-right">{stat.label}</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-2xl font-bold tracking-tight text-white md:text-3xl">{stat.value}</span>
              {stat.suffix ? <span className="text-xs text-muted/80">{stat.suffix}</span> : null}
            </div>
            {stat.growth ? (
              <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
                <span>{stat.growth}</span>
                <span className="text-[10px] text-muted/50 font-normal">vs last month</span>
              </div>
            ) : null}
          </motion.div>
        );
      })}
    </div>
  );
}
