"use client";

import React from "react";

import { LeaderboardPage } from "@/app/contests/[slug]/_common/leaderboard-page";
import { useGuestDashboard } from "@/store/slices/guest-dashboard-slice";

export default function GuestLeaderboardPage() {
  const problems = useGuestDashboard((state) => state.contest.problems);
  const leaderboard = useGuestDashboard((state) => state.leaderboard);

  return <LeaderboardPage problems={problems} leaderboard={leaderboard} />;
}
