import React from "react";

import { LeaderboardPage } from "@/app/[slug]/(dashboard)/_common/leaderboard-page";
import { useAppSelector } from "@/store/store";

export function JudgeLeaderboardPage() {
  const problems = useAppSelector(
    (state) => state.judgeDashboard.data!.contest.problems,
  );
  const leaderboard = useAppSelector(
    (state) => state.judgeDashboard.data!.leaderboard,
  );

  return <LeaderboardPage problems={problems} leaderboard={leaderboard} />;
}
