import React from "react";

import { LeaderboardPage } from "@/app/[slug]/(dashboard)/_common/leaderboard/LeaderboardPage";
import { useAppSelector } from "@/app/_lib/store/Store";

export function AdminLeaderboardPage() {
  const problems = useAppSelector((state) => state.adminDashboard.problems);
  const leaderboard = useAppSelector(
    (state) => state.adminDashboard.leaderboard,
  );

  return <LeaderboardPage problems={problems} leaderboard={leaderboard} />;
}
