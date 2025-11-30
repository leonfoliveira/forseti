"use client";

import React from "react";

import { AnnouncementsPage } from "@/app/[slug]/(dashboard)/_common/announcements-page";
import { useAppSelector } from "@/app/_store/store";

export function ContestantAnnouncementsPage() {
  const contestId = useAppSelector((state) => state.contestMetadata.id);
  const announcements = useAppSelector(
    (state) => state.contestantDashboard.contest.announcements,
  );

  return (
    <AnnouncementsPage contestId={contestId} announcements={announcements} />
  );
}
