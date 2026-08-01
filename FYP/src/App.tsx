import { Route, Routes } from "react-router-dom";
import { AmbientProvider } from "@/features/reader/AmbientProvider";
import { PWARegister } from "@/components/PWARegister";
import { ThemeModeProvider } from "@/components/ThemeModeProvider";
import { Toaster } from "@/components/Toaster";

import HomePage from "@/app/page";
import AdminLoginPage from "@/app/admin/login/page";
import GoogleAuthPage from "@/app/auth/google/page";
import AdminDashboardPage from "@/app/dashboard/admin/page";
import AnalyticsPage from "@/app/dashboard/analytics/page";
import WriterDashboardPage from "@/app/dashboard/writer/page";
import LoginPage from "@/app/login/page";
import NotificationsPage from "@/app/notifications/page";
import ProfilePage from "@/app/profile/page";
import ProfileEditPage from "@/app/profile/edit/page";
import ReadPage from "@/app/read/[chapterId]/page";
import RegisterPage from "@/app/register/page";
import SavedStoriesPage from "@/app/saved-stories/page";
import SeriesPage from "@/app/series/page";
import SeriesDetailPage from "@/app/series/[id]/page";
import SettingsPage from "@/app/settings/page";
import VaultPage from "@/app/vault/page";
import WalletPage from "@/app/wallet/page";

function NotFoundPage() {
  return (
    <div className="grid min-h-dvh place-items-center px-4 text-center">
      <div>
        <div className="font-display text-5xl tracking-widest">404</div>
        <div className="mt-2 text-muted">Page not found.</div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="sf-ambient min-h-dvh">
      <ThemeModeProvider />
      <div className="relative z-10">
        <AmbientProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/auth/google" element={<GoogleAuthPage />} />
            <Route path="/dashboard/admin" element={<AdminDashboardPage />} />
            <Route path="/dashboard/analytics" element={<AnalyticsPage />} />
            <Route path="/dashboard/writer" element={<WriterDashboardPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/edit" element={<ProfileEditPage />} />
            <Route path="/read/:chapterId" element={<ReadPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/saved-stories" element={<SavedStoriesPage />} />
            <Route path="/series" element={<SeriesPage />} />
            <Route path="/series/:id" element={<SeriesDetailPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/vault" element={<VaultPage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AmbientProvider>
      </div>
      <PWARegister />
      <Toaster />
    </div>
  );
}
