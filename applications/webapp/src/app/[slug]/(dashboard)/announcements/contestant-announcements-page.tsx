"use client";

import React from "react";

import { AnnouncementsPage } from "@/app/[slug]/(dashboard)/_common/announcements/announcements-page";
import { useAppSelector } from "@/app/_store/store";

export function ContestantAnnouncementsPage() {
  const announcements = useAppSelector(
    (state) => state.contestantDashboard.contest.announcements,
  );

  return <AnnouncementsPage announcements={announcements} />;
}
