import React from "react";

import { useAppSelector } from "@/app/_lib/store/Store";
import { LeaderboardPage } from "@/app/[slug]/(dashboard)/_common/leaderboard/LeaderboardPage";

export function ContestantLeaderboardPage() {
  const problems = useAppSelector(
    (state) => state.contestantDashboard.problems,
  );
  const leaderboard = useAppSelector(
    (state) => state.contestantDashboard.leaderboard,
  );

  return <LeaderboardPage problems={problems} leaderboard={leaderboard} />;
}
