"use client";

import React from "react";
import { TimelinePage } from "@/app/contests/[slug]/_common/timeline-page";
import { useContestantContext } from "@/app/contests/[slug]/contestant/_context/contestant-context";

export default function ContestantTimelinePage() {
  const { submissions } = useContestantContext();

  return <TimelinePage submissions={submissions} />;
}
