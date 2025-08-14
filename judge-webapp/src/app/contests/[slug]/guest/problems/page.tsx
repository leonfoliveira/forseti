"use client";

import React from "react";

import { ProblemsPage } from "@/app/contests/[slug]/_common/problems-page";
import { useGuestDashboard } from "@/store/slices/guest-dashboard-slice";

export default function GuestProblemsPage() {
  const problems = useGuestDashboard((state) => state.contest.problems);

  return <ProblemsPage problems={problems} />;
}
