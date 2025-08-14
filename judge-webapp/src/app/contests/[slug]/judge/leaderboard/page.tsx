"use client";

import React from "react";

import { LeaderboardPage } from "@/app/contests/[slug]/_common/leaderboard-page";
import { useJudgeDashboard } from "@/store/slices/judge-dashboard-slice";

export default function JudgeLeaderboardPage() {
  const problems = useJudgeDashboard((state) => state.contest.problems);
  const leaderboard = useJudgeDashboard((state) => state.leaderboard);

  return <LeaderboardPage problems={problems} leaderboard={leaderboard} />;
}
