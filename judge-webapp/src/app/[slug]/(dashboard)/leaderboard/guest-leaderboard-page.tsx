import React from "react";

import { LeaderboardPage } from "@/app/[slug]/(dashboard)/_common/leaderboard-page";
import { useAppSelector } from "@/store/store";

export function GuestLeaderboardPage() {
  const problems = useAppSelector(
    (state) => state.guestDashboard.contest.problems,
  );
  const leaderboard = useAppSelector(
    (state) => state.guestDashboard.leaderboard,
  );

  return <LeaderboardPage problems={problems} leaderboard={leaderboard} />;
}
