"use client";

import { Coins } from "lucide-react";
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
            <div className="font-display text-3xl tracking-widest">Wallet</div>
            <div className="mt-1 text-sm text-muted">Coin Wallet & Economy</div>
          </div>
          <Badge tone="gold" className="gap-2 text-base">
            <Coins className="h-4 w-4" /> <span className="tabular-nums">{balance} Coins</span>
          </Badge>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
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
