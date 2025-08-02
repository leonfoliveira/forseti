"use client";

import { redirect } from "next/navigation";
import { routes } from "@/config/routes";
import { useContestMetadata } from "@/app/contests/[slug]/_context/contest-metadata-context";

export default function JudgePage() {
  const contest = useContestMetadata();

  return redirect(routes.CONTEST_JUDGE_LEADERBOARD(contest.slug));
}
