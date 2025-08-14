"use client";

import React from "react";

import { ClarificationsPage } from "@/app/contests/[slug]/_common/clarifications-page";
import { useContestMetadata } from "@/store/slices/contest-metadata-slice";
import { useContestantDashboard } from "@/store/slices/contestant-dashboard-slice";

export default function ContestantClarificationsPage() {
  const { id } = useContestMetadata();
  const problems = useContestantDashboard((state) => state.contest.problems);
  const clarifications = useContestantDashboard(
    (state) => state.contest.clarifications,
  );

  return (
    <ClarificationsPage
      contestId={id}
      problems={problems}
      clarifications={clarifications}
      canCreate
    />
  );
}
