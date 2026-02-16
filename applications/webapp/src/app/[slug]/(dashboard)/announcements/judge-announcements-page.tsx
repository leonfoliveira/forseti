"use client";

import React from "react";

import { AnnouncementsPage } from "@/app/[slug]/(dashboard)/_common/announcements/announcements-page";
import { useAppSelector } from "@/app/_store/store";

export function JudgeAnnouncementsPage() {
  const announcements = useAppSelector(
    (state) => state.judgeDashboard.contest.announcements,
  );

  return <AnnouncementsPage announcements={announcements} />;
}
