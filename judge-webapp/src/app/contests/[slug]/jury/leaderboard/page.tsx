"use client";

import React from "react";
import { LeaderboardPage } from "@/app/contests/[slug]/_common/leaderboard-page";
import { useJuryContext } from "@/app/contests/[slug]/jury/_context/jury-context";

export default function JuryLeaderboardPage() {
  const { contest, leaderboard } = useJuryContext();

  return <LeaderboardPage contest={contest} leaderboard={leaderboard} />;
}
