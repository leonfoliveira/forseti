import React from "react";

import { useAppSelector } from "@/app/_lib/store/Store";
import { LeaderboardPage } from "@/app/[slug]/(dashboard)/_common/leaderboard/LeaderboardPage";

export function SpectatorLeaderboardPage() {
  const problems = useAppSelector((state) => state.spectatorDashboard.problems);
  const leaderboard = useAppSelector(
    (state) => state.spectatorDashboard.leaderboard,
  );

  return <LeaderboardPage problems={problems} leaderboard={leaderboard} />;
}
