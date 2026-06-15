"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { useToastStore } from "@/store/toastStore";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function PWAInstallBanner() {
  const toast = useToastStore((s) => s.push);
  const [evt, setEvt] = useState<BIPEvent | null>(null);
  const [secure, setSecure] = useState(true);
  const [protocol, setProtocol] = useState<string>("https:");
  const [swSupported, setSwSupported] = useState(true);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setEvt(e as BIPEvent);
    };
    window.addEventListener("beforeinstallprompt", handler as any);
    return () => window.removeEventListener("beforeinstallprompt", handler as any);
  }, []);

  useEffect(() => {
    setSecure(window.isSecureContext);
    setProtocol(window.location.protocol);
    setSwSupported("serviceWorker" in navigator);
  }, []);

  return (
    <div className="mt-6 flex flex-col items-start gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between">
      <div>
        <div className="text-sm font-semibold">Install FYP</div>
        <div className="text-xs text-muted">
          Offline install (PWA) + Play Store option (UI-only).
        </div>
        <div className="mt-1 text-[11px] text-muted">
          Status:{" "}
          <span className={evt ? "text-emerald-300" : "text-muted"}>
            {evt ? "Install prompt ready" : "Install prompt not ready"}
          </span>
          {!secure || protocol !== "https:" ? (
            <span className="ml-2 text-danger">Requires HTTPS/localhost</span>
          ) : null}
          {!swSupported ? <span className="ml-2 text-danger">No Service Worker</span> : null}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={async () => {
            if (!evt) {
              toast({
                tone: "default",
                title: "Offline install",
                message:
                  !secure || protocol !== "https:"
                    ? "Install requires HTTPS or localhost."
                    : !swSupported
                      ? "Service Worker not supported in this browser."
                      : "Install prompt not available yet (open in Chrome, visit a few pages, then try again)."
              });
              return;
            }
            await evt.prompt();
            const choice = await evt.userChoice;
            toast({
              tone: choice.outcome === "accepted" ? "success" : "default",
              title: "Offline install",
              message: choice.outcome === "accepted" ? "Installed (browser controlled)." : "Dismissed."
            });
            setEvt(null);
          }}
        >
          Offline Install
        </Button>

        <Button
          variant="ghost"
          onClick={() => {
            toast({
              tone: "default",
              title: "Play Store",
              message: "Add your Play Store URL later (currently a UI stub)."
            });
            window.open("https://play.google.com/store", "_blank", "noopener,noreferrer");
          }}
        >
          Play Store
        </Button>
      </div>
    </div>
  );
}
