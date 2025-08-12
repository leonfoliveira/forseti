"use client";

import React from "react";

import { TimelinePage } from "@/app/contests/[slug]/_common/timeline-page";
import { useGuestDashboard } from "@/store/slices/guest-dashboard-slice";

export default function GuestTimelinePage() {
  const submissions = useGuestDashboard((state) => state.submissions);

  return <TimelinePage submissions={submissions} />;
}
