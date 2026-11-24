import React from "react";

import { useAppSelector } from "@/app/_lib/store/Store";
import { LeaderboardPage } from "@/app/[slug]/(dashboard)/_common/leaderboard/LeaderboardPage";

export function JudgeLeaderboardPage() {
  const problems = useAppSelector((state) => state.judgeDashboard.problems);
  const leaderboard = useAppSelector(
    (state) => state.judgeDashboard.leaderboard,
  );

  return <LeaderboardPage problems={problems} leaderboard={leaderboard} />;
}
