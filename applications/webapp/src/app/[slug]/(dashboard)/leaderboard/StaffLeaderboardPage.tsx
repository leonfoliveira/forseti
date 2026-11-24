import React from "react";

import { useAppSelector } from "@/app/_lib/store/Store";
import { LeaderboardPage } from "@/app/[slug]/(dashboard)/_common/leaderboard/LeaderboardPage";

export function StaffLeaderboardPage() {
  const problems = useAppSelector((state) => state.staffDashboard.problems);
  const leaderboard = useAppSelector(
    (state) => state.staffDashboard.leaderboard,
  );

  return <LeaderboardPage problems={problems} leaderboard={leaderboard} />;
}
