"use client";

import { useRouter } from "@/compat/next-navigation";
import { 
  Bell, 
  Sparkles, 
  BookOpen, 
  Star, 
  Flame, 
  MessageSquare, 
  Gift, 
  ChevronLeft, 
  CheckCircle2 
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/Button";
import { RequireAuth } from "@/components/RequireAuth";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  unread: boolean;
  icon: any;
  color: string;
  bgColor: string;
  href: string;
};

export default function NotificationsPage() {
  const router = useRouter();

  const [items, setItems] = useState<NotificationItem[]>([
    {
      id: "n1",
      title: "Welcome to FYP Comics",
      message: "🎉 Welcome to the future of immersive comic reading! Grab your free coins and start exploring.",
      timestamp: "2 mins ago",
      unread: true,
      icon: Sparkles,
      color: "text-primary",
      bgColor: "bg-primary/10 border-primary/20",
      href: "/series"
    },
    {
      id: "n2",
      title: "New Chapter Released",
      message: "📚 Night City Blade Chapter 4: 'Neon Vows' is now available! Dive back into the cyber-action.",
      timestamp: "1 hour ago",
      unread: true,
      icon: BookOpen,
      color: "text-highlight",
      bgColor: "bg-highlight/10 border-highlight/20",
      href: "/series/s1"
    },
    {
      id: "n3",
      title: "You earned 50 points",
      message: "⭐ Loyalty reward added! You earned 50 loyalty points for reading for 15 minutes today.",
      timestamp: "4 hours ago",
      unread: false,
      icon: Star,
      color: "text-gold",
      bgColor: "bg-gold/10 border-gold/20",
      href: "/profile"
    },
    {
      id: "n4",
      title: "New Comic Added",
      message: "🔥 'The Hollow Map' by N. Kade has just launched in Sci-Fi. Every line drawn is a door...",
      timestamp: "Yesterday",
      unread: false,
      icon: Flame,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10 border-orange-500/20",
      href: "/series/s4"
    },
    {
      id: "n5",
      title: "Someone liked your comment",
      message: "💬 Your theory about the violet glowing blade on Rose & Ruin was liked by 24 others.",
      timestamp: "2 days ago",
      unread: false,
      icon: MessageSquare,
      color: "text-indigo-400",
      bgColor: "bg-indigo-400/10 border-indigo-400/20",
      href: "/series/s2"
    },
    {
      id: "n6",
      title: "Daily Reward Available",
      message: "🎁 Don't lose your streak! Claim your daily check-in reward and secure 10 bonus coins.",
      timestamp: "3 days ago",
      unread: false,
      icon: Gift,
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10 border-emerald-400/20",
      href: "/wallet"
    }
  ]);

  function markAllAsRead() {
    setItems((prev) => prev.map((item) => ({ ...item, unread: false })));
  }

  function toggleRead(id: string) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, unread: !item.unread } : item))
    );
  }

  const unreadCount = items.filter((item) => item.unread).length;

  return (
    <RequireAuth>
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 min-h-[85vh]">
        {/* Title panel */}
        <div className="sf-comic-panel sf-comic-surface rounded-3xl border border-white/10 bg-card p-6 shadow-glow">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-highlight text-white shadow-lg">
                <Bell className="h-6 w-6 animate-swing" />
              </div>
              <div>
                <div className="font-display text-3xl tracking-widest text-white">Notifications</div>
                <div className="text-sm text-muted">
                  {unreadCount > 0 ? `${unreadCount} unread updates` : "All caught up!"}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={markAllAsRead} className="gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Mark all read
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="gap-2">
                <ChevronLeft className="h-4 w-4" /> Back Home
              </Button>
            </div>
          </div>
        </div>

        {/* Scrollable notifications list */}
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {items.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                    item.unread
                      ? "border-primary/20 bg-card/90 shadow-[0_0_20px_rgba(255,51,102,0.06)]"
                      : "border-white/5 bg-card/40 opacity-80"
                  } hover:scale-[1.01] hover:border-white/20 hover:opacity-100 hover:bg-card/70 group`}
                >
                  <div className="flex items-start gap-4 p-5">
                    {/* Icon container */}
                    <div className={`p-3 rounded-2xl shrink-0 ${item.bgColor} ${item.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`font-semibold text-sm sm:text-base ${item.unread ? "text-white" : "text-white/80"}`}>
                          {item.title}
                        </span>
                        <span className="text-[11px] text-muted whitespace-nowrap">{item.timestamp}</span>
                      </div>
                      <p className="text-sm text-muted leading-relaxed line-clamp-2 pr-4">{item.message}</p>
                      
                      {/* Interaction Row */}
                      <div className="pt-2 flex items-center gap-3">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => router.push(item.href)}
                          className="h-8 text-xs font-semibold px-3"
                        >
                          View Detail
                        </Button>
                        <button
                          onClick={() => toggleRead(item.id)}
                          className="text-xs text-muted hover:text-white transition decoration-transparent"
                        >
                          {item.unread ? "Mark as Read" : "Mark as Unread"}
                        </button>
                      </div>
                    </div>

                    {/* Unread dot indicator */}
                    {item.unread && (
                      <span className="absolute top-5 right-5 h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_var(--sf-primary)] animate-pulse" />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </RequireAuth>
  );
}
