"use client";

import React from "react";
import { TimelinePage } from "@/app/contests/[slug]/_common/timeline-page";
import { useGuestContext } from "@/app/contests/[slug]/guest/_context/guest-context";

export default function GuestTimelinePage() {
  const { submissions } = useGuestContext();

  return <TimelinePage submissions={submissions} />;
}
