import React from "react";

import { LeaderboardPage } from "@/app/[slug]/(dashboard)/_common/leaderboard/leaderboard-page";
import { useAppSelector } from "@/app/_store/store";

export function ContestantLeaderboardPage() {
  const problems = useAppSelector(
    (state) => state.contestantDashboard.problems,
  );
  const leaderboard = useAppSelector(
    (state) => state.contestantDashboard.leaderboard,
  );

  return <LeaderboardPage problems={problems} leaderboard={leaderboard} />;
}
