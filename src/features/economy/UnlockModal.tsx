"use client";

import { Coins, LockOpen, TriangleAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import type { Chapter } from "@/lib/types";
import { useWalletStore } from "@/store/walletStore";
import { useToastStore } from "@/store/toastStore";

export function UnlockModal({
  open,
  chapter,
  onClose,
  onUnlocked
}: {
  open: boolean;
  chapter: Chapter | null;
  onClose: () => void;
  onUnlocked: () => void;
}) {
  const balance = useWalletStore((s) => s.coinBalance);
  const spendCoins = useWalletStore((s) => s.spendCoins);
  const toast = useToastStore((s) => s.push);
  const [state, setState] = useState<"idle" | "success" | "insufficient">("idle");

  useEffect(() => {
    if (!open) setState("idle");
  }, [open]);

  const cost = useMemo(() => chapter?.coinPrice ?? 5, [chapter?.coinPrice]);

  async function confirmUnlock() {
    if (!chapter) return;
    const ok = spendCoins(cost, chapter.id);
    if (!ok) {
      setState("insufficient");
      toast({ tone: "danger", title: "Not enough coins", message: "Add coins in Wallet to unlock." });
      return;
    }

    // Fire-and-forget mock API (for real integration, handle failure + rollback).
    fetch("/api/economy/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chapter_id: chapter.id, cost_coins: cost })
    }).catch(() => {});

    setState("success");
    toast({ tone: "success", title: "Unlocked", message: `Chapter ${chapter.number} unlocked (demo).` });
    setTimeout(() => onUnlocked(), 650);
  }

  return (
    <Modal
      open={open}
      title={
        <div className="flex items-center justify-between gap-4">
          <div className="font-display text-2xl tracking-widest">Unlock</div>
          <div className="text-xs text-muted">Balance: {balance} Coins</div>
        </div>
      }
      onClose={onClose}
    >
      {!chapter ? (
        <div className="text-muted">No chapter selected.</div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
            <div className="text-sm font-semibold">Unlock Chapter {chapter.number} — Early Access</div>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <Coins className="h-4 w-4 text-gold" />
              <span className="font-semibold">{cost} Coins</span>
            </div>
            <div className="mt-1 text-xs text-muted">
              Current balance: <span className="tabular-nums">{balance}</span>
            </div>
          </div>

          {state === "insufficient" ? (
            <div className="flex items-start gap-2 rounded-2xl border border-danger/30 bg-danger/10 p-3 text-sm">
              <TriangleAlert className="mt-0.5 h-4 w-4 text-danger" />
              <div>
                <div className="font-semibold text-white">Insufficient coins</div>
                <div className="text-white/75">Get more coins to unlock this chapter.</div>
              </div>
            </div>
          ) : null}

          {state === "success" ? (
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm">
              <LockOpen className="h-4 w-4 text-emerald-400" />
              <div className="font-semibold">Chapter Unlocked!</div>
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={confirmUnlock} disabled={state === "success"}>
              Confirm Unlock
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
