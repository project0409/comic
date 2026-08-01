import type { Metadata } from "next";
import "./globals.css";
import { AmbientProvider } from "@/features/reader/AmbientProvider";
import { PWARegister } from "@/components/PWARegister";
import { ThemeModeProvider } from "@/components/ThemeModeProvider";
import { Toaster } from "@/components/Toaster";

export const metadata: Metadata = {
  title: "FYP Comic Platform",
  description: "Premium comic reading platform"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <div className="sf-ambient min-h-dvh">
          <ThemeModeProvider />
          <div className="relative z-10">
            <AmbientProvider>{children}</AmbientProvider>
          </div>
          <PWARegister />
          <Toaster />
        </div>
      </body>
    </html>
  );
}