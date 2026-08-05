"use client";

import { Coins, Star } from "lucide-react";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { useWalletStore } from "@/store/walletStore";
import { useToastStore } from "@/store/toastStore";
import { RequireAuth } from "@/components/RequireAuth";

const bundles = [
  { coins: 50, price: "$0.99" },
  { coins: 150, price: "$2.49" },
  { coins: 500, price: "$6.99" }
];

export default function WalletPage() {
  const balance = useWalletStore((s) => s.coinBalance);
  const history = useWalletStore((s) => s.unlockHistory);
  const setBalance = useWalletStore((s) => s.setBalance);
  const toast = useToastStore((s) => s.push);

  return (
    <RequireAuth>
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10">
      <div className="rounded-3xl border border-white/10 bg-card p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-display text-3xl tracking-widest text-white">Wallet</div>
            <div className="mt-1 text-sm text-muted">Coin Wallet & Economy</div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 grid-cols-1 md:grid-cols-2">
          {/* Coin Balance Card */}
          <div className="rounded-3xl border border-white/10 bg-black/20 p-5 flex items-center justify-between hover:border-white/20 transition duration-300">
            <div>
              <div className="text-sm text-muted flex items-center gap-2 font-medium">
                <Coins className="h-4 w-4 text-gold" />
                Coin Balance
              </div>
              <div className="mt-3 text-3xl font-bold tabular-nums text-white">{balance} Coins</div>
            </div>
            <Badge tone="gold">Active</Badge>
          </div>

          {/* Premium Points Card */}
          <div className="relative overflow-hidden rounded-3xl border border-transparent bg-gradient-to-br from-violet-600 via-indigo-700 to-pink-500 p-5 shadow-[0_8px_32px_rgba(124,58,237,0.22)] transition hover:scale-[1.02] hover:shadow-[0_12px_42px_rgba(124,58,237,0.3)] duration-300">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-xl" />
            <div className="absolute -left-4 -bottom-4 h-16 w-16 rounded-full bg-white/5 blur-lg" />
            
            <div className="relative flex items-center gap-2 text-sm text-white/90">
              <Star className="h-4 w-4 fill-white text-white" />
              Points
            </div>
            <div className="relative mt-3 text-3xl font-bold tabular-nums text-white">12,560</div>
            <div className="relative mt-1 text-[11px] font-semibold text-white/80">+250 earned today</div>
          </div>
        </div>

        <div className="mt-8">
          <div className="text-sm font-semibold uppercase tracking-wider text-muted mb-3">Buy Coin Bundles</div>
          <div className="grid gap-3 md:grid-cols-3">
          {bundles.map((b) => (
            <div key={b.coins} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{b.coins} Coins</div>
                <div className="text-sm text-muted">{b.price}</div>
              </div>
              <div className="mt-3">
                <Button
                  variant="gold"
                  className="w-full"
                  onClick={() => {
                    setBalance(balance + b.coins);
                    toast({ tone: "gold", title: "Coins added", message: `+${b.coins} coins (demo).` });
                  }}
                >
                  Get Coins
                </Button>
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-card p-6">
        <div className="font-display text-2xl tracking-widest">Transaction history</div>
        <div className="mt-3 overflow-hidden rounded-2xl border border-white/10">
          <div className="grid grid-cols-3 bg-white/5 px-4 py-2 text-xs text-muted">
            <div>Date</div>
            <div>Description</div>
            <div className="text-right">Coins</div>
          </div>
          {history.length === 0 ? (
            <div className="px-4 py-6 text-sm text-muted">No transactions yet.</div>
          ) : (
            history.slice(0, 12).map((h) => (
              <div key={h.atIso} className="grid grid-cols-3 border-t border-white/8 px-4 py-3 text-sm">
                <div className="text-muted">{new Date(h.atIso).toLocaleDateString()}</div>
                <div>Unlocked {h.chapterId}</div>
                <div className="text-right text-gold">-{h.spent}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
    </RequireAuth>
  );
}
