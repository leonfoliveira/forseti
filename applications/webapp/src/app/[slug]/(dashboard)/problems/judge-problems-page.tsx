"use client";

import React from "react";

import { ProblemsPage } from "@/app/[slug]/(dashboard)/_common/problems-page";
import { useAppSelector } from "@/app/_store/store";

export function JudgeProblemsPage() {
  const problems = useAppSelector(
    (state) => state.judgeDashboard.contest.problems,
  );

  return <ProblemsPage problems={problems} />;
}
