"use client";

import React from "react";

import { LeaderboardPage } from "@/app/contests/[slug]/_common/leaderboard-page";
import { useGuestContext } from "@/app/contests/[slug]/guest/_context/guest-context";

export default function GuestLeaderboardPage() {
  const { contest, leaderboard } = useGuestContext();

  return <LeaderboardPage contest={contest} leaderboard={leaderboard} />;
}
