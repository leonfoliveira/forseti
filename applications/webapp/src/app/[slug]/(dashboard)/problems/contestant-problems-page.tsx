"use client";

import React from "react";

import { ProblemsPage } from "@/app/[slug]/(dashboard)/_common/problems/problems-page";
import { useAppSelector } from "@/app/_store/store";

export function ContestantProblemsPage() {
  const session = useAppSelector((state) => state.session);
  const problems = useAppSelector(
    (state) => state.contestantDashboard.contest.problems,
  );
  const classification = useAppSelector(
    (state) => state.contestantDashboard.leaderboard.members,
  );
  const contestantClassification = classification.find(
    (it) => it.id === session!.member.id,
  );

  return (
    <ProblemsPage
      problems={problems}
      contestantClassificationProblems={contestantClassification!.problems}
    />
  );
}
