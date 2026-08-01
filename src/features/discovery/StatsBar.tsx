"use client";

import { Coins, Star, BookOpen, Users } from "lucide-react";
import { motion } from "framer-motion";
import { platformStats } from "@/lib/mockData";

export function StatsBar({ coinBalance }: { coinBalance: number }) {
  const stats = [
    {
      icon: Coins,
      label: "Available Balance",
      value: `${coinBalance}`,
      suffix: "Coins",
      accent: "text-gold"
    },
    {
      icon: Star,
      label: "Avg Rating Score",
      value: `${platformStats.avgRating}`,
      suffix: "/ 5.0",
      accent: "text-highlight"
    },
    {
      icon: BookOpen,
      label: "Monthly Reads",
      value: `${Math.floor(platformStats.monthlyReads / 1000)}K+`,
      suffix: "",
      accent: "text-primary"
    },
    {
      icon: Users,
      label: "Active Creators",
      value: `${platformStats.activeCreators}`,
      suffix: "Indie",
      accent: "text-white"
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="sf-comic-panel sf-comic-surface rounded-2xl border border-white/10 bg-surface/80 p-4"
          >
            <div className="mb-2 flex items-center gap-2">
              <Icon className={`h-4 w-4 ${stat.accent}`} />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">{stat.label}</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-2xl tracking-wide text-white md:text-3xl">{stat.value}</span>
              {stat.suffix ? <span className="text-xs text-muted">{stat.suffix}</span> : null}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
