"use client";

import React from "react";
import { ClarificationsPage } from "@/app/contests/[slug]/_common/clarifications-page";
import { useContestantContext } from "@/app/contests/[slug]/contestant/_context/contestant-context";

export default function ContestantClarificationsPage() {
  const { contest } = useContestantContext();

  return <ClarificationsPage contest={contest} canCreate />;
}
