"use client";

import React from "react";

import { ClarificationsPage } from "@/app/[slug]/(dashboard)/_common/clarifications-page";
import { useAppSelector } from "@/store/store";

export function JudgeClarificationsPage() {
  const contestId = useAppSelector((state) => state.contestMetadata.id);
  const problems = useAppSelector(
    (state) => state.judgeDashboard.contest.problems,
  );
  const clarifications = useAppSelector(
    (state) => state.judgeDashboard.contest.clarifications,
  );

  return (
    <ClarificationsPage
      contestId={contestId}
      problems={problems}
      clarifications={clarifications}
      canAnswer
    />
  );
}
