import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";
import { PWARegister } from "@/components/PWARegister";
import { AmbientProvider } from "@/features/reader/AmbientProvider";
import { Toaster } from "@/components/Toaster";
import { InteractiveBackground } from "@/components/InteractiveBackground";

const display = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--sf-font-display"
});

const ui = Inter({
  subsets: ["latin"],
  variable: "--sf-font-ui"
});

export const metadata: Metadata = {
  title: "FYP",
  description: "Where reading meets cinema",
  manifest: "/manifest.webmanifest"
};

export const viewport: Viewport = {
  themeColor: "#080A12"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${ui.variable}`}>
      <body className="sf-ambient min-h-dvh">
        <InteractiveBackground />
        <div className="relative z-10">
          <AmbientProvider>{children}</AmbientProvider>
        </div>
        <PWARegister />
        <Toaster />
      </body>
    </html>
  );
}
