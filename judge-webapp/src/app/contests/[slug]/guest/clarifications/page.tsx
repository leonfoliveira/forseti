"use client";

import React from "react";

import { ClarificationsPage } from "@/app/contests/[slug]/_common/clarifications-page";
import { useContestMetadata } from "@/store/slices/contest-metadata-slice";
import { useGuestDashboard } from "@/store/slices/guest-dashboard-slice";

export default function GuestClarificationsPage() {
  const { id } = useContestMetadata();
  const problems = useGuestDashboard((state) => state.contest.problems);
  const clarifications = useGuestDashboard(
    (state) => state.contest.clarifications,
  );

  return (
    <ClarificationsPage
      contestId={id}
      problems={problems}
      clarifications={clarifications}
    />
  );
}
