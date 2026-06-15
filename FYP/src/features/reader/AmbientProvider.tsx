"use client";

import { useEffect } from "react";
import { useUiStore } from "@/store/uiStore";

export function AmbientProvider({ children }: { children: React.ReactNode }) {
  const ambientColor = useUiStore((s) => s.ambientColor);

  useEffect(() => {
    document.documentElement.style.setProperty("--sf-ambient", ambientColor);
  }, [ambientColor]);

  return <>{children}</>;
}

