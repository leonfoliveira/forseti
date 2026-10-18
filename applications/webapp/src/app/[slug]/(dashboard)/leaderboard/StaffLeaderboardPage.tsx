import React from "react";

import { LeaderboardPage } from "@/app/[slug]/(dashboard)/_common/leaderboard/LeaderboardPage";
import { useAppSelector } from "@/app/_lib/store/Store";

export function StaffLeaderboardPage() {
  const problems = useAppSelector((state) => state.staffDashboard.problems);
  const leaderboard = useAppSelector(
    (state) => state.staffDashboard.leaderboard,
  );

  return <LeaderboardPage problems={problems} leaderboard={leaderboard} />;
}
