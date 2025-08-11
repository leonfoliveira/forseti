"use client";

import React from "react";

import { AnnouncementsPage } from "@/app/contests/[slug]/_common/announcements-page";
import { useContestantContext } from "@/app/contests/[slug]/contestant/_context/contestant-context";

export default function ContestantAnnouncementsPage() {
  const { contest } = useContestantContext();

  return <AnnouncementsPage contest={contest} />;
}
