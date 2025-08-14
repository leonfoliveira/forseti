"use client";

import { redirect } from "next/navigation";

import { routes } from "@/config/routes";
import { useContestMetadata } from "@/store/slices/contest-metadata-slice";

export default function ContestantPage() {
  const contest = useContestMetadata();

  return redirect(routes.CONTEST_CONTESTANT_LEADERBOARD(contest.slug));
}
