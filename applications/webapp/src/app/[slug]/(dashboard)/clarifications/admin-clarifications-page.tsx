"use client";

import React from "react";

import { ClarificationsPage } from "@/app/[slug]/(dashboard)/_common/clarifications/clarifications-page";
import { useAppSelector } from "@/app/_store/store";

export function AdminClarificationsPage() {
  const problems = useAppSelector(
    (state) => state.adminDashboard.contest.problems,
  );
  const clarifications = useAppSelector(
    (state) => state.adminDashboard.contest.clarifications,
  );

  return (
    <ClarificationsPage
      problems={problems}
      clarifications={clarifications}
      canAnswer
    />
  );
}
