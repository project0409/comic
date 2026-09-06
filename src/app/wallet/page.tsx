"use client";

import { useEffect } from "react";
import { useRouter } from "@/compat/next-navigation";
import { Sparkles, BookOpen } from "lucide-react";
import { Button } from "@/components/Button";
import Link from "@/compat/next-link";

export default function WalletPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/library");
  }, [router]);

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center space-y-4">
      <div className="grid h-16 w-16 mx-auto place-items-center rounded-3xl bg-primary/20 text-primary">
        <Sparkles className="h-8 w-8" />
      </div>
      <h1 className="font-display text-3xl font-bold text-white">All Comics Are 100% Free!</h1>
      <p className="text-muted text-sm max-w-md mx-auto">
        Coins are no longer required on FYP. All released chapters are immediately unlocked and free to read.
      </p>
      <div className="flex justify-center gap-3 pt-2">
        <Link href="/library">
          <Button variant="primary" className="gap-2">
            <BookOpen className="h-4 w-4" /> Go to Library
          </Button>
        </Link>
        <Link href="/series">
          <Button variant="outline">Browse Comics</Button>
        </Link>
      </div>
    </div>
  );
}
