"use client";

import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { Button } from "@/components/Button";
import { RequireAuth } from "@/components/RequireAuth";

const notifications = [
  { title: "New fantasy chapter", message: "A featured fantasy series has a new chapter ready to read.", href: "/series" },
  { title: "Wallet reminder", message: "Check your coin balance before unlocking early access chapters.", href: "/wallet" },
  { title: "Vault tip", message: "Your saved panels and reactions are available from the vault.", href: "/vault" }
];

export default function NotificationsPage() {
  const router = useRouter();

  return (
    <RequireAuth>
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
        <div className="rounded-3xl border border-white/10 bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/20 text-primary">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <div className="font-display text-3xl tracking-widest">Notifications</div>
              <div className="text-sm text-muted">Recent updates and account reminders.</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {notifications.map((item) => (
            <div key={item.title} className="rounded-3xl border border-white/10 bg-card p-5">
              <div className="font-semibold">{item.title}</div>
              <div className="mt-1 text-sm text-muted">{item.message}</div>
              <Button className="mt-4" variant="outline" size="sm" onClick={() => router.push(item.href)}>
                Open
              </Button>
            </div>
          ))}
        </div>
      </div>
    </RequireAuth>
  );
}
