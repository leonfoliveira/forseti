"use client";

import { redirect } from "next/navigation";

import { routes } from "@/config/routes";
import { useContest } from "@/store/slices/contest-slice";

export default function JudgePage() {
  const contest = useContest();

  return redirect(routes.CONTEST_JUDGE_LEADERBOARD(contest.slug));
}
