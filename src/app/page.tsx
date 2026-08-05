"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { SplashScreen } from "@/components/SplashScreen";
import { LandingPage } from "@/features/discovery/LandingPage";
import { HomePage } from "@/features/discovery/HomePage";

export default function Page() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash ? (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      ) : isAuthenticated ? (
        <HomePage />
      ) : (
        <LandingPage />
      )}
    </>
  );
}
