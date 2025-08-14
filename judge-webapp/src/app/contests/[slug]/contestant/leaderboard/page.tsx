"use client";

import React from "react";

import { LeaderboardPage } from "@/app/contests/[slug]/_common/leaderboard-page";
import { useContestantDashboard } from "@/store/slices/contestant-dashboard-slice";

export default function ContestantLeaderboardPage() {
  const problems = useContestantDashboard((state) => state.contest.problems);
  const leaderboard = useContestantDashboard((state) => state.leaderboard);

  return <LeaderboardPage problems={problems} leaderboard={leaderboard} />;
}
