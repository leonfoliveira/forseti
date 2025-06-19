"use client";

import React from "react";
import { TimelinePage } from "@/app/contests/[slug]/_common/timeline-page";
import { useContest } from "@/app/contests/[slug]/_component/context/contest-context";

export default function ContestantTimelinePage() {
  const {
    contestant: { submissions },
  } = useContest();

  return <TimelinePage submissions={submissions} />;
}
