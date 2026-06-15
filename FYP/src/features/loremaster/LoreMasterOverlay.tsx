"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { cn } from "@/components/cn";
import { useReaderStore } from "@/store/readerStore";
import { useUiStore } from "@/store/uiStore";

type Msg =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "ai"; text: string; typing?: boolean };

function useTypewriter(text: string, enabled: boolean) {
  const [out, setOut] = useState("");
  useEffect(() => {
    if (!enabled) {
      setOut(text);
      return;
    }
    setOut("");
    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(timer);
    }, 14);
    return () => clearInterval(timer);
  }, [text, enabled]);
  return out;
}

export function LoreMasterOverlay() {
  const open = useUiStore((s) => s.loreMasterOpen);
  const setOpen = useUiStore((s) => s.setLoreMasterOpen);
  const currentPage = useReaderStore((s) => s.currentPage);

  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  const spoilerBadge = useMemo(() => `Answering up to Page ${currentPage} only`, [currentPage]);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight }), 0);
  }, [open, msgs.length]);

  async function submit() {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", text: q };
    setMsgs((s) => [...s, userMsg, { id: crypto.randomUUID(), role: "ai", text: "", typing: true }]);
    setLoading(true);

    try {
      const res = await fetch("/api/loremaster/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query_text: q, current_page: currentPage })
      });
      const data = (await res.json()) as { answer_text: string };
      setMsgs((s) => {
        const copy = [...s];
        const idx = copy.findIndex((m) => m.role === "ai" && (m as any).typing);
        if (idx >= 0) copy[idx] = { id: copy[idx].id, role: "ai", text: data.answer_text };
        return copy;
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/80 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            className="w-full max-w-2xl rounded-t-3xl border border-white/10 bg-elevated"
            initial={{ y: 40 }}
            animate={{ y: 0 }}
            exit={{ y: 40 }}
            transition={{ type: "spring", stiffness: 240, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
              <div>
                <div className="font-display text-xl tracking-widest">🧙 Lore Master</div>
                <div className="text-xs text-muted">{spoilerBadge}</div>
              </div>
              <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm" onClick={() => setOpen(false)}>
                ×
              </button>
            </div>

            <div ref={listRef} className="max-h-[60vh] overflow-y-auto px-4 py-4">
              <div className="space-y-3">
                {msgs.map((m) => (
                  <ChatBubble key={m.id} msg={m} loading={loading} />
                ))}
              </div>
            </div>

            <div className="border-t border-white/10 p-4">
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => (e.key === "Enter" ? submit() : undefined)}
                  placeholder="Ask about the lore..."
                  className="h-11 flex-1 rounded-2xl border border-white/10 bg-black/25 px-4 text-sm outline-none placeholder:text-muted"
                />
                <Button variant="primary" onClick={submit} disabled={!input.trim() || loading}>
                  Send
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function ChatBubble({ msg, loading }: { msg: Msg; loading: boolean }) {
  const isUser = msg.role === "user";
  const typed = useTypewriter(msg.text, msg.role === "ai");
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[86%] rounded-2xl px-4 py-3 text-sm",
          isUser ? "bg-primary text-black" : "border border-white/10 bg-black/25 text-white shadow-[0_0_0_1px_rgba(124,58,237,0.15)]"
        )}
      >
        {"typing" in msg && msg.typing ? (
          <div className="flex gap-1">
            <Dot /> <Dot delay={0.12} /> <Dot delay={0.24} />
          </div>
        ) : (
          <span>{msg.role === "ai" ? typed : msg.text}</span>
        )}
        {msg.role === "ai" && loading && !("typing" in msg) ? null : null}
      </div>
    </div>
  );
}

function Dot({ delay = 0 }: { delay?: number }) {
  return (
    <motion.span
      className="inline-block h-1.5 w-1.5 rounded-full bg-white/70"
      animate={{ opacity: [0.25, 1, 0.25] }}
      transition={{ duration: 0.9, repeat: Infinity, delay }}
    />
  );
}
