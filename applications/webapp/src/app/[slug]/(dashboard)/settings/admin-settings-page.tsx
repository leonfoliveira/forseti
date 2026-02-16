"use client";

import { SettingsPage } from "@/app/[slug]/(dashboard)/_common/settings/settings-page";
import { adminDashboardSlice } from "@/app/_store/slices/admin-dashboard-slice";
import { useAppDispatch, useAppSelector } from "@/app/_store/store";

/**
 * Displays the admin settings page for a contest.
 * Allows administrators to configure contest settings, manage problems, and members.
 */
export function AdminSettingsPage() {
  const contest = useAppSelector((state) => state.adminDashboard.contest);
  const leaderboard = useAppSelector(
    (state) => state.adminDashboard.leaderboard,
  );
  const dispatch = useAppDispatch();

  return (
    <SettingsPage
      contest={contest}
      leaderboard={leaderboard}
      onToggleFreeze={(isFrozen) => {
        dispatch(adminDashboardSlice.actions.setLeaderboardIsFrozen(isFrozen));
      }}
    />
  );
}
