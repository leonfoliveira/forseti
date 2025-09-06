"use client";

import React from "react";

import { ProblemsPage } from "@/app/[slug]/(dashboard)/_common/problems-page";
import { useAppSelector } from "@/store/store";

export function GuestProblemsPage() {
  const problems = useAppSelector(
    (state) => state.guestDashboard.contest.problems,
  );

  return <ProblemsPage problems={problems} />;
}
