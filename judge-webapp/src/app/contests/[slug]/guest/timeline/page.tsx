"use client";

import React from "react";
import { TimelinePage } from "@/app/contests/[slug]/_component/page/timeline-page";
import { useContest } from "@/app/contests/[slug]/_component/context/contest-context";

export default function GuestTimelinePage() {
  const {
    guest: { submissions },
  } = useContest();

  return <TimelinePage submissions={submissions} />;
}
