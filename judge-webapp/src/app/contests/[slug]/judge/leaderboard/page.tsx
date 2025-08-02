"use client";

import React from "react";
import { LeaderboardPage } from "@/app/contests/[slug]/_common/leaderboard-page";
import { useJudgeContext } from "@/app/contests/[slug]/judge/_context/judge-context";

export default function JudgeLeaderboardPage() {
  const { contest, leaderboard } = useJudgeContext();

  return <LeaderboardPage contest={contest} leaderboard={leaderboard} />;
}
