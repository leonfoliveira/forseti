import React from "react";

import { LeaderboardPage } from "@/app/[slug]/(dashboard)/_common/leaderboard/leaderboard-page";
import { useAppSelector } from "@/app/_store/store";

export function StaffLeaderboardPage() {
  const problems = useAppSelector(
    (state) => state.staffDashboard.contest.problems,
  );
  const leaderboard = useAppSelector(
    (state) => state.staffDashboard.leaderboard,
  );

  return <LeaderboardPage problems={problems} leaderboard={leaderboard} />;
}
