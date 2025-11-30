import React from "react";

import { LeaderboardPage } from "@/app/[slug]/(dashboard)/_common/leaderboard-page";
import { useAppSelector } from "@/app/_store/store";

export function JudgeLeaderboardPage() {
  const problems = useAppSelector(
    (state) => state.judgeDashboard.contest.problems,
  );
  const leaderboard = useAppSelector(
    (state) => state.judgeDashboard.leaderboard,
  );

  return <LeaderboardPage problems={problems} leaderboard={leaderboard} />;
}
