"use client";

import React from "react";

import { ProblemsPage } from "@/app/contests/[slug]/_common/problems-page";
import { useJudgeDashboard } from "@/store/slices/judge-dashboard-slice";

export default function JudgeProblemsPage() {
  const problems = useJudgeDashboard((state) => state.contest.problems);

  return <ProblemsPage problems={problems} />;
}
