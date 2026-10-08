"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "@/compat/next-navigation";
import { ImmersiveReader } from "@/features/reader/ImmersiveReader";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { Button } from "@/components/Button";
import { recordGuestRead, type GuestReadResult } from "@/lib/guestReaderLimit";

export default function ReadPage() {
  const { chapterId } = useParams<{ chapterId: string }>();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();
  const toast = useToastStore((s) => s.push);

  const [guestResult, setGuestResult] = useState<GuestReadResult | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      setGuestResult({ allowed: true, count: 0, max: 2 });
      return;
    }

    // Process guest read allowance (up to 2 comics, max 2 chapters each)
    const res = recordGuestRead(chapterId);
    setGuestResult(res);

    if (res.allowed) {
      toast({
        tone: "default",
        title: `Guest Preview (${res.count}/${res.max} comics)`,
        message: "Enjoying your free preview comic. Sign up anytime to track reading history and rate chapters!"
      });
    } else {
      if (res.reason === "chapter_limit") {
        toast({
          tone: "danger",
          title: "Chapter Preview Limit",
          message: `Guest preview is limited to the first 2 chapters. Please log in to read Chapter ${res.chapterNumber || 3}.`
        });
      } else {
        toast({
          tone: "danger",
          title: "Free Preview Limit Reached (2/2)",
          message: "You've read your 2 free preview comics! Please sign in or create an account to read your 3rd comic."
        });
      }
    }
  }, [isAuthenticated, chapterId, toast, router]);

  if (guestResult === null) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-bg px-4">
        <div className="text-sm text-muted">Checking access…</div>
      </div>
    );
  }

  // If unauthenticated and not allowed (either 3rd comic or chapter > 2)
  if (!isAuthenticated && !guestResult.allowed) {
    const isChapterLimit = guestResult.reason === "chapter_limit";

    return (
      <div className="min-h-dvh flex items-center justify-center bg-bg px-4">
        <div className="sf-comic-panel rounded-3xl border border-primary/30 bg-card p-8 max-w-lg text-center space-y-5 shadow-2xl shadow-primary/10">
          <div className="text-4xl select-none">🔒</div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-display tracking-wider text-white">
              {isChapterLimit ? "Free Chapter Preview Limit" : "Free Preview Limit Reached (2/2 Comics)"}
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              {isChapterLimit
                ? `Guest preview is limited to the first 2 chapters of each comic. Please sign in or create a free account to read Chapter ${guestResult.chapterNumber || 3} and unlock full series reading.`
                : "You've enjoyed your 2 free guest comics! Sign up today for free to unlock your 3rd comic and enjoy unlimited reading across all series."}
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
