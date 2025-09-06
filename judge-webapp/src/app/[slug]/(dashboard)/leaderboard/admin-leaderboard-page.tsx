import React from "react";

import { LeaderboardPage } from "@/app/[slug]/(dashboard)/_common/leaderboard-page";
import { useAppSelector } from "@/store/store";

export function AdminLeaderboardPage() {
  const problems = useAppSelector(
    (state) => state.adminDashboard.contest.problems,
  );
  const leaderboard = useAppSelector(
    (state) => state.adminDashboard.leaderboard,
  );

  return <LeaderboardPage problems={problems} leaderboard={leaderboard} />;
}
