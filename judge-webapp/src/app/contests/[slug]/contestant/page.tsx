"use client";

import { redirect } from "next/navigation";

import { useContestMetadata } from "@/app/contests/[slug]/_context/contest-metadata-context";
import { routes } from "@/config/routes";

export default function ContestantPage() {
  const contest = useContestMetadata();

  return redirect(routes.CONTEST_CONTESTANT_LEADERBOARD(contest.slug));
}
