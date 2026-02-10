"use client";

import React from "react";

import { ClarificationsPage } from "@/app/[slug]/(dashboard)/_common/clarifications/clarifications-page";
import { useAppSelector } from "@/app/_store/store";

export function ContestantClarificationsPage() {
  const problems = useAppSelector(
    (state) => state.contestantDashboard.contest.problems,
  );
  const clarifications = useAppSelector(
    (state) => state.contestantDashboard.contest.clarifications,
  );

  return (
    <ClarificationsPage
      problems={problems}
      clarifications={clarifications}
      canCreate
    />
  );
}
