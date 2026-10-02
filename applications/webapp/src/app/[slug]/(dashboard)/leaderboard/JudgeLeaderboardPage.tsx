import React from "react";

import { LeaderboardPage } from "@/app/[slug]/(dashboard)/_common/leaderboard/LeaderboardPage";
import { useAppSelector } from "@/app/_lib/store/Store";

export function JudgeLeaderboardPage() {
  const problems = useAppSelector((state) => state.judgeDashboard.problems);
  const leaderboard = useAppSelector(
    (state) => state.judgeDashboard.leaderboard,
  );

  return <LeaderboardPage problems={problems} leaderboard={leaderboard} />;
}
