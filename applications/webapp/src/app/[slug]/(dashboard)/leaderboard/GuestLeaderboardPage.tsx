import React from "react";

import { LeaderboardPage } from "@/app/[slug]/(dashboard)/_common/leaderboard/LeaderboardPage";
import { useAppSelector } from "@/app/_lib/store/Store";

export function GuestLeaderboardPage() {
  const problems = useAppSelector((state) => state.guestDashboard.problems);
  const leaderboard = useAppSelector(
    (state) => state.guestDashboard.leaderboard,
  );

  return <LeaderboardPage problems={problems} leaderboard={leaderboard} />;
}
