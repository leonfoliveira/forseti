"use client";

import React from "react";

import { ClarificationsPage } from "@/app/[slug]/(dashboard)/_common/clarifications/clarifications-page";
import { useAppSelector } from "@/app/_store/store";

export function StaffClarificationsPage() {
  const problems = useAppSelector(
    (state) => state.staffDashboard.contest.problems,
  );
  const clarifications = useAppSelector(
    (state) => state.staffDashboard.contest.clarifications,
  );

  return (
    <ClarificationsPage problems={problems} clarifications={clarifications} />
  );
}
