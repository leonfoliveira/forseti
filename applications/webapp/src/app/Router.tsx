import React, { Suspense } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { ContestLayout } from "./[slug]/ContestLayout";
import { DashboardLayout } from "@/app/[slug]/(dashboard)/DashboardLayout";
import { LoadingPage } from "@/app/_lib/component/page/LoadingPage";

const HomePage = React.lazy(() => import("./HomePage"));
const ForbiddenPage = React.lazy(() => import("./error/ForbiddenPage"));
const NotFoundPage = React.lazy(() => import("./error/NotFoundPage"));
const ServerErrorPage = React.lazy(() => import("./error/ServerErrorPage"));
const ServiceUnavailablePage = React.lazy(
  () => import("./error/ServiceUnavailablePage"),
);
const SignInPage = React.lazy(() => import("./[slug]/sign-in/SignInPage"));
const DashboardAboutPage = React.lazy(
  () => import("./[slug]/(dashboard)/about/AboutPage"),
);
const DashboardAnnouncementsPage = React.lazy(
  () => import("./[slug]/(dashboard)/announcements/AnnouncementsPage"),
);
const DashboardClarificationsPage = React.lazy(
  () => import("./[slug]/(dashboard)/clarifications/ClarificationsPage"),
);
const DashboardLeaderboardPage = React.lazy(
  () => import("./[slug]/(dashboard)/leaderboard/LeaderboardPage"),
);
const DashboardPrintRequestsPage = React.lazy(
  () => import("./[slug]/(dashboard)/printRequests/PrintRequestsPage"),
);
const DashboardProblemsPage = React.lazy(
  () => import("./[slug]/(dashboard)/problems/ProblemsPage"),
);
const DashboardSettingsPage = React.lazy(
  () => import("./[slug]/(dashboard)/settings/SettingsPage"),
);
const DashboardSubmissionsPage = React.lazy(
  () => import("./[slug]/(dashboard)/submissions/SubmissionsPage"),
);

export function Router() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingPage />}>
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/error/403" element={<ForbiddenPage />} />
          <Route path="/error/404" element={<NotFoundPage />} />
          <Route path="/error/500" element={<ServerErrorPage />} />
          <Route path="/error/503" element={<ServiceUnavailablePage />} />

          <Route element={<ContestLayout />}>
            <Route
              path="/:slug"
              element={<Navigate to="leaderboard" replace />}
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
              <Route
                path="/:slug/problems"
                element={<DashboardProblemsPage />}
              />
              <Route
                path="/:slug/settings"
                element={<DashboardSettingsPage />}
              />
              <Route
                path="/:slug/submissions"
                element={<DashboardSubmissionsPage />}
              />
              <Route
                path="/:slug/print-requests"
                element={<DashboardPrintRequestsPage />}
              />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
