"use client";

import React from "react";

import { AnnouncementsPage } from "@/app/contests/[slug]/_common/announcements-page";
import { useContestMetadata } from "@/store/slices/contest-metadata-slice";
import { useContestantDashboard } from "@/store/slices/contestant-dashboard-slice";

export default function ContestantAnnouncementsPage() {
  const { id } = useContestMetadata();
  const announcements = useContestantDashboard(
    (state) => state.contest.announcements,
  );

  return <AnnouncementsPage contestId={id} announcements={announcements} />;
}
