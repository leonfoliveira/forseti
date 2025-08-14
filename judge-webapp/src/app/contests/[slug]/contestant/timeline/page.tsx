"use client";

import React from "react";

import { TimelinePage } from "@/app/contests/[slug]/_common/timeline-page";
import { useContestantDashboard } from "@/store/slices/contestant-dashboard-slice";

export default function ContestantTimelinePage() {
  const submissions = useContestantDashboard((state) => state.submissions);

  return <TimelinePage submissions={submissions} />;
}
