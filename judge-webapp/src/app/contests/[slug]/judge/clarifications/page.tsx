"use client";

import React from "react";

import { ClarificationsPage } from "@/app/contests/[slug]/_common/clarifications-page";
import { useContestMetadata } from "@/store/slices/contest-metadata-slice";
import { useJudgeDashboard } from "@/store/slices/judge-dashboard-slice";

export default function JudgeClarificationsPage() {
  const { id } = useContestMetadata();
  const problems = useJudgeDashboard((state) => state.contest.problems);
  const clarifications = useJudgeDashboard(
    (state) => state.contest.clarifications,
  );

  return (
    <ClarificationsPage
      contestId={id}
      problems={problems}
      clarifications={clarifications}
      canAnswer
    />
  );
}
