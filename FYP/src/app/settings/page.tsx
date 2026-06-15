"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { RequireAuth } from "@/components/RequireAuth";
import { useToastStore } from "@/store/toastStore";

export default function SettingsPage() {
  const toast = useToastStore((s) => s.push);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [autoPlayAudio, setAutoPlayAudio] = useState(false);
  const [spoilerShield, setSpoilerShield] = useState(true);

  return (
    <RequireAuth>
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
        <div className="rounded-3xl border border-white/10 bg-card p-6">
          <div className="font-display text-3xl tracking-widest">Settings</div>
          <div className="mt-1 text-sm text-muted">Control reading and notification preferences.</div>

          <div className="mt-6 divide-y divide-white/10 rounded-2xl border border-white/10">
            {[
              { label: "Email notifications", value: emailAlerts, setValue: setEmailAlerts },
              { label: "Auto-play reader audio", value: autoPlayAudio, setValue: setAutoPlayAudio },
              { label: "Spoiler shield", value: spoilerShield, setValue: setSpoilerShield }
            ].map((item) => (
              <label key={item.label} className="flex cursor-pointer items-center justify-between gap-4 px-4 py-4">
                <span className="text-sm">{item.label}</span>
                <input
                  type="checkbox"
                  checked={item.value}
                  onChange={(e) => item.setValue(e.target.checked)}
                  className="h-5 w-5 accent-[var(--sf-primary)]"
                />
              </label>
            ))}
          </div>

          <Button
            className="mt-5"
            variant="primary"
            onClick={() => toast({ tone: "success", title: "Settings saved", message: "Your preferences were updated." })}
          >
            Save Settings
          </Button>
        </div>
      </div>
    </RequireAuth>
  );
}
