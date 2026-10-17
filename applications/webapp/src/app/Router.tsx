import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { DashboardClarificationsPage } from "@/app/[slug]/(dashboard)/clarifications/DashboardClarificationsPage";
import { DashboardAnnouncementsPage } from "@/app/[slug]/(dashboard)/announcements/DashboardAnnouncementsPage";
import { ContestLayout } from "./[slug]/ContestLayout";
import { HomePage } from "./HomePage";
import { DashboardAboutPage } from "@/app/[slug]/(dashboard)/about/DashboardAboutPage";
import { ServerErrorPage } from "./error/ServerErrorPage";
import { ServiceUnavailablePage } from "./error/ServiceUnavailablePage";
import { NotFoundPage } from "./error/NotFoundPage";
import { ForbiddenPage } from "@/app/error/ForbiddenPage";
import { SignInPage } from "@/app/[slug]/sign-in/SignInPage";
import { DashboardLayout } from "@/app/[slug]/(dashboard)/DashboardLayout";
import { DashboardLeaderboardPage } from "@/app/[slug]/(dashboard)/leaderboard/DashboardLeaderboardPage";
import { DashboardProblemsPage } from "@/app/[slug]/(dashboard)/problems/DashboardProblemsPage";
import { DashboardSettingsPage } from "@/app/[slug]/(dashboard)/settings/DashboardSettingsPage";
import { DashboardSubmissionsPage } from "@/app/[slug]/(dashboard)/submissions/DashboardSubmissionsPage";

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/error/403" element={<ForbiddenPage />} />
        <Route path="/error/404" element={<NotFoundPage />} />
        <Route path="/error/500" element={<ServerErrorPage />} />
        <Route path="/error/503" element={<ServiceUnavailablePage />} />

        <Route element={<ContestLayout />}>
          <Route
            path="/:slug"
            element={<Navigate to="/:slug/leaderboard" replace />}
          />

          <Route path="/:slug/sign-in" element={<SignInPage />} />

          <Route element={<DashboardLayout />}>
            <Route path="/:slug/about" element={<DashboardAboutPage />} />
            <Route
              path="/:slug/announcements"
              element={<DashboardAnnouncementsPage />}
            />
            <Route
              path="/:slug/clarifications"
              element={<DashboardClarificationsPage />}
            />
            <Route
              path="/:slug/leaderboard"
              element={<DashboardLeaderboardPage />}
            />
            <Route path="/:slug/problems" element={<DashboardProblemsPage />} />
            <Route path="/:slug/settings" element={<DashboardSettingsPage />} />
            <Route
              path="/:slug/submissions"
              element={<DashboardSubmissionsPage />}
            />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
