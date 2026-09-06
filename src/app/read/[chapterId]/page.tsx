"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "@/compat/next-navigation";
import { ImmersiveReader } from "@/features/reader/ImmersiveReader";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { Button } from "@/components/Button";
import { recordGuestRead } from "@/lib/guestReaderLimit";

export default function ReadPage() {
  const { chapterId } = useParams<{ chapterId: string }>();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();
  const toast = useToastStore((s) => s.push);

  const [guestAllowed, setGuestAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      setGuestAllowed(true);
      return;
    }

    // Process guest read allowance (2 free comics)
    const res = recordGuestRead(chapterId);
    setGuestAllowed(res.allowed);

    if (res.allowed) {
      toast({
        tone: "default",
        title: `Guest Preview (${res.count}/${res.max})`,
        message: "Enjoying your free preview comic. Sign up anytime to track reading history and rate chapters!"
      });
    } else {
      toast({
        tone: "danger",
        title: "Free Preview Limit Reached (2/2)",
        message: "You've read your 2 free preview comics! Please sign in or create an account to continue reading."
      });
    }
  }, [isAuthenticated, chapterId, toast, router]);

  if (guestAllowed === null) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-bg px-4">
        <div className="text-sm text-muted">Checking access…</div>
      </div>
    );
  }

  // If unauthenticated and exceeded 2 free comics
  if (!isAuthenticated && !guestAllowed) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-bg px-4">
        <div className="sf-comic-panel rounded-3xl border border-primary/30 bg-card p-8 max-w-lg text-center space-y-5 shadow-2xl shadow-primary/10">
          <div className="text-4xl select-none">🎁</div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-display tracking-wider text-white">
              Free Preview Limit Reached (2/2)
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              You&apos;ve enjoyed your 2 free guest comics! Sign up today for free to unlock unlimited reading across all comics, rate chapters, and join the community discussions.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push(`/register?redirectTo=/read/${chapterId}`)}
              className="gap-2 shadow-lg shadow-primary/30 font-bold"
            >
              Sign Up for Free
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push(`/login?redirectTo=/read/${chapterId}`)}
            >
              Log In
            </Button>
          </div>

          <div className="pt-2 border-t border-white/5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/discover")}
              className="text-xs text-muted"
            >
              ← Back to Catalog
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <ImmersiveReader chapterId={chapterId} />;
}
