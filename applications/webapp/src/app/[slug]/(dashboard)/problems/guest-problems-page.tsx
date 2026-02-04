"use client";

import React from "react";

import { ProblemsPage } from "@/app/[slug]/(dashboard)/_common/problems/problems-page";
import { useAppSelector } from "@/app/_store/store";

export function GuestProblemsPage() {
  const problems = useAppSelector(
    (state) => state.guestDashboard.contest.problems,
  );

  return <ProblemsPage problems={problems} />;
}
