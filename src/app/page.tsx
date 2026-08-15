"use client";

import { Suspense, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { SplashScreen } from "@/components/SplashScreen";
import { LandingPage } from "@/features/landing/LandingPage";
import { HomePage } from "@/features/discovery/HomePage";

export default function Page() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash ? (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      ) : isAuthenticated ? (
        <Suspense fallback={null}>
          <HomePage />
        </Suspense>
      ) : (
        <LandingPage />
      )}
    </>
  );
}
