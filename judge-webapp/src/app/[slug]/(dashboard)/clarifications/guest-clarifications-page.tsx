"use client";

import React from "react";

import { ClarificationsPage } from "@/app/[slug]/(dashboard)/_common/clarifications-page";
import { useAppSelector } from "@/store/store";

export function GuestClarificationsPage() {
  const contestId = useAppSelector((state) => state.contestMetadata.id);
  const problems = useAppSelector(
    (state) => state.guestDashboard.data!.contest.problems,
  );
  const clarifications = useAppSelector(
    (state) => state.guestDashboard.data!.contest.clarifications,
  );

  return (
    <ClarificationsPage
      contestId={contestId}
      problems={problems}
      clarifications={clarifications}
    />
  );
}
