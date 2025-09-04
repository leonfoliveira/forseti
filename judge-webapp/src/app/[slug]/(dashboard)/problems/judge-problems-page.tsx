"use client";

import React from "react";

import { ProblemsPage } from "@/app/[slug]/(dashboard)/_common/problems-page";
import { useAppSelector } from "@/store/store";

export function JudgeProblemsPage() {
  const problems = useAppSelector(
    (state) => state.judgeDashboard.data!.contest.problems,
  );

  return <ProblemsPage problems={problems} />;
}
