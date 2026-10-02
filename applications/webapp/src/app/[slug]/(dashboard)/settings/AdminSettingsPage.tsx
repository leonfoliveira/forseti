"use client";

import { SettingsPage } from "@/app/[slug]/(dashboard)/_common/settings/SettingsPage";
import { useAppSelector } from "@/app/_lib/store/Store";

/**
 * Displays the admin settings page for a contest.
 * Allows administrators to configure contest settings, manage problems, and members.
 */
export function AdminSettingsPage() {
  const contest = useAppSelector((state) => state.adminDashboard.contest);
  const leaderboard = useAppSelector(
    (state) => state.adminDashboard.leaderboard,
  );

  return <SettingsPage contest={contest} leaderboard={leaderboard} />;
}
