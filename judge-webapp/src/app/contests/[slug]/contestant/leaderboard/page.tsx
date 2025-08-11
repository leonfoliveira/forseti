"use client";

import React from "react";

import { LeaderboardPage } from "@/app/contests/[slug]/_common/leaderboard-page";
import { useContestantContext } from "@/app/contests/[slug]/contestant/_context/contestant-context";

export default function ContestantLeaderboardPage() {
  const { contest, leaderboard } = useContestantContext();

  return <LeaderboardPage contest={contest} leaderboard={leaderboard} />;
}
