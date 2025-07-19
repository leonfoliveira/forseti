"use client";

import { redirect } from "next/navigation";
import { routes } from "@/routes";
import { useContestMetadata } from "@/app/contests/[slug]/_component/context/contest-metadata-context";

export default function ContestantPage() {
  const contest = useContestMetadata();

  return redirect(routes.CONTEST_CONTESTANT_LEADERBOARD(contest.slug));
}
