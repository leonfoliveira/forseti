"use client";

import React from "react";

import { ProblemsPage } from "@/app/[slug]/(dashboard)/_common/problems-page";
import { useAppSelector } from "@/store/store";

export function ContestantProblemsPage() {
  const authorization = useAppSelector((state) => state.authorization);
  const problems = useAppSelector(
    (state) => state.contestantDashboard.contest.problems,
  );
  const classification = useAppSelector(
    (state) => state.contestantDashboard.leaderboard.members,
  );
  const contestantClassification = classification.find(
    (it) => it.id === authorization!.member.id,
  );

  return (
    <ProblemsPage
      problems={problems}
      contestantClassificationProblems={contestantClassification!.problems}
    />
  );
}
