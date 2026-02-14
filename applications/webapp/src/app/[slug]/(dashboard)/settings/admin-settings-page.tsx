"use client";

import { SettingsPage } from "@/app/[slug]/(dashboard)/_common/settings/settings-page";
import { useAppSelector } from "@/app/_store/store";

/**
 * Displays the admin settings page for a contest.
 * Allows administrators to configure contest settings, manage problems, and members.
 */
export function AdminSettingsPage() {
  const contest = useAppSelector((state) => state.adminDashboard.contest);

  return <SettingsPage contest={contest} />;
}
